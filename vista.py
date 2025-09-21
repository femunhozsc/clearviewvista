import csv
import os
import pandas as pd
from datetime import datetime
import yfinance as yf
import requests
from pytz import timezone
try:
    from difflib import get_close_matches
    DIFFLIB_AVAILABLE = True
except ImportError:
    DIFFLIB_AVAILABLE = False
from dateutil.relativedelta import relativedelta
import math
import re

class ClearviewVista:
    """
    Motor de dados para análise de ativos financeiros.
    """
    def __init__(self):
        self.cache = {}
        self.tickers_map = {}
        self.nomes_map = {}
        self.lista_completa_ativos = []

        print("Carregando base de dados de ativos...")
        self.carregar_dados_csv('acoes-listadas-b3.csv', 'EQUITY', delimiter=',')
        self.carregar_dados_csv('fundosListados.csv', 'MUTUALFUND', delimiter=';')
        print(f"✅ Base de dados carregada com {len(self.lista_completa_ativos)} ativos para sugestão.")
        
        if not DIFFLIB_AVAILABLE:
            print("\n⚠️  Atenção: A biblioteca 'difflib' não foi encontrada.")

        self.traducoes = {
            'EQUITY': 'Ação', 'CRYPTOCURRENCY': 'Criptomoeda', 'CURRENCY': 'Moeda',
            'ETF': 'ETF', 'INDEX': 'Índice', 'MUTUALFUND': 'Fundo Imobiliário (FII)'
        }

    def carregar_dados_csv(self, arquivo_csv, tipo_ativo, delimiter=','):
        try:
            with open(arquivo_csv, mode='r', encoding='utf-8') as f:
                leitor = csv.reader(f, delimiter=delimiter)
                header = next(leitor) 
                
                ticker_idx, nome_idx = -1, -1
                for i, col in enumerate(header):
                    col_lower = col.lower()
                    if 'ticker' in col_lower or 'código' in col_lower:
                        ticker_idx = i
                    if 'name' in col_lower or 'fundo' in col_lower or 'razão social' in col_lower:
                        nome_idx = i
                
                if ticker_idx == -1 or nome_idx == -1:
                    print(f"  - ⚠️  Aviso: Não foi possível identificar as colunas em '{arquivo_csv}'. Pulando.")
                    return
                
                count = 0
                for linha in leitor:
                    if len(linha) > max(ticker_idx, nome_idx):
                        ticker_base = linha[ticker_idx].strip().upper()
                        nome = linha[nome_idx].strip().title()

                        if ticker_base and nome:
                            if tipo_ativo in ['MUTUALFUND', 'ETF'] and not ticker_base.endswith('11'):
                                ticker_base += '11'
                            
                            ticker_sa = f"{ticker_base}.SA"
                            
                            self.tickers_map[ticker_sa] = nome
                            self.tickers_map[ticker_base] = ticker_sa
                            if nome.upper() not in self.nomes_map: self.nomes_map[nome.upper()] = []
                            self.nomes_map[nome.upper()].append(ticker_sa)
                            
                            self.lista_completa_ativos.append({
                                'ticker': ticker_base,
                                'nome': nome,
                                'tipo': tipo_ativo
                            })
                            count += 1
                if count > 0:
                    print(f"  - Arquivo '{arquivo_csv}' ({tipo_ativo}): {count} tickers adicionados.")

        except FileNotFoundError:
             print(f"  - ⚠️  Aviso: Arquivo '{arquivo_csv}' não encontrado.")
        except Exception as e:
            print(f"❌ Erro ao carregar o arquivo '{arquivo_csv}': {e}")


    def pesquisar_ativo(self, comando):
        comando_upper = comando.strip().upper()
        
        if comando_upper.startswith('^'): return [comando_upper]

        if '-' in comando_upper:
            partes = comando_upper.split('-')
            if len(partes) == 2:
                moedas_fiat_conhecidas = ['USD', 'BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF']
                if partes[0] in moedas_fiat_conhecidas and partes[1] in moedas_fiat_conhecidas:
                    return [f"{partes[0]}{partes[1]}=X"]
            return [comando_upper]

        if comando_upper in self.tickers_map: return [self.tickers_map[comando_upper]]
        if re.match(r'^[A-Z]{4}\d{1,2}$', comando_upper): return [f"{comando_upper}.SA"]
        if comando_upper in self.nomes_map: return self.nomes_map[comando_upper]

        if DIFFLIB_AVAILABLE:
            matches = get_close_matches(comando_upper, self.nomes_map.keys(), n=5, cutoff=0.6)
            if matches:
                tickers_encontrados = [ticker for match in matches for ticker in self.nomes_map[match]]
                return list(set(tickers_encontrados))

        return [f"{comando_upper}.SA"]

    def _fetch_ticker_data(self, ticker):
        try:
            ativo = yf.Ticker(ticker)
            info = ativo.info
            if not info or info.get('quoteType') is None: return None
            hist = ativo.history(period="5y")
            return {"info": info, "historico": hist}
        except Exception:
            return None

    def buscar_dados_ativo(self, ticker):
        if ticker in self.cache: return self.cache[ticker]

        dados = self._fetch_ticker_data(ticker)
        if dados:
            self.cache[ticker] = dados
            return dados

        if ticker.upper().endswith('-BRL'):
            print(f"⚠️  Não foi possível buscar {ticker} diretamente. Tentando conversão via USD...")
            base_crypto = ticker.split('-')[0]
            ticker_usd, ticker_cambio = f"{base_crypto}-USD", 'USDBRL=X'
            
            dados_usd = self.buscar_dados_ativo(ticker_usd)
            dados_cambio = self.buscar_dados_ativo(ticker_cambio)

            if dados_usd and dados_cambio:
                info_usd, hist_usd = dados_usd['info'], dados_usd['historico']
                cambio_atual = dados_cambio['info']['regularMarketPrice']
                hist_cambio = dados_cambio['historico']['Close']

                info_sintetico = info_usd.copy()
                info_sintetico['currency'] = 'BRL'
                for key in ['regularMarketPrice', 'dayHigh', 'dayLow', 'open', 'previousClose', 'marketCap']:
                    if info_sintetico.get(key):
                        info_sintetico[key] *= cambio_atual
                
                df_merged = pd.concat([hist_usd, hist_cambio.rename('Cambio')], axis=1)
                df_merged['Cambio'].ffill(inplace=True)
                df_merged.dropna(subset=['Open'], inplace=True)
                for col in ['Open', 'High', 'Low', 'Close']:
                    df_merged[col] *= df_merged['Cambio']
                
                dados_sinteticos = {'info': info_sintetico, 'historico': df_merged.drop(columns=['Cambio'])}
                self.cache[ticker] = dados_sinteticos
                print(f"✅ Conversão de {ticker_usd} para BRL realizada com sucesso!")
                return dados_sinteticos

        return None

    def formatar_valor(self, valor, tipo='numero', moeda='R$'):
        if not isinstance(valor, (int, float)): return "N/D"
        try:
            if tipo == 'porcentagem': return f"{valor * 100:,.2f}%"
            if tipo == 'bilhoes': return f"R$ {valor / 1e9:,.2f} Bi"
            
            prefixo = f"{moeda} " if tipo == 'moeda' else ""
            if abs(valor) >= 1e9: return f"{prefixo}{valor / 1e9:,.2f} Bi"
            if abs(valor) >= 1e6: return f"{prefixo}{valor / 1e6:,.2f} Mi"
            return f"{prefixo}{valor:,.2f}"
        except (ValueError, TypeError): return "N/D"

