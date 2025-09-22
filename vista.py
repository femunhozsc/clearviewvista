import csv
import os
import pandas as pd
from datetime import datetime
import yfinance as yf
try:
    from difflib import get_close_matches
    DIFFLIB_AVAILABLE = True
except ImportError:
    DIFFLIB_AVAILABLE = False

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
        self.carregar_dados_csv('etfs-listados-b3.csv', 'ETF', delimiter=',')
        print(f"✅ Base de dados carregada com {len(self.lista_completa_ativos)} ativos para sugestão.")
        
        if not DIFFLIB_AVAILABLE:
            print("\n⚠️  Atenção: A biblioteca 'difflib' não foi encontrada.")
            print("  A pesquisa por nome aproximado de empresa estará desativada.\n")

        self.traducoes = {
            'IBOV': '^BVSP', 'S&P 500': '^GSPC', 'NASDAQ': '^IXIC',
            'EUR': 'EURBRL=X', 'USD': 'BRL=X', 'BTC': 'BTC-USD'
        }
        self.nomes_formatados = {
            '^BVSP': 'Ibovespa', '^GSPC': 'S&P 500', '^IXIC': 'Nasdaq Composite',
            'EURBRL=X': 'Euro', 'BRL=X': 'Dólar Americano', 'BTC-USD': 'Bitcoin'
        }

    def carregar_dados_csv(self, filename, tipo, delimiter=','):
        """Carrega dados de um arquivo CSV, tratando o erro caso o arquivo não exista."""
        if not os.path.exists(filename):
            print(f"⚠️  Aviso: Arquivo de dados '{filename}' não encontrado. Ativos deste tipo não serão carregados.")
            return
            
        try:
            with open(filename, mode='r', encoding='utf-8') as infile:
                reader = csv.reader(infile, delimiter=delimiter)
                header = next(reader)
                
                ticker_col_idx = -1
                nome_col_idx = -1

                if 'Ticker' in header:
                    ticker_col_idx = header.index('Ticker')
                elif 'Código' in header:
                    ticker_col_idx = header.index('Código')
                
                if 'Nome' in header:
                    nome_col_idx = header.index('Nome')
                elif 'Razão Social' in header:
                    nome_col_idx = header.index('Razão Social')
                
                if ticker_col_idx == -1 or nome_col_idx == -1:
                    print(f"Pulando {filename}: Colunas de Ticker/Nome não encontradas no cabeçalho: {header}")
                    return

                for row in reader:
                    try:
                        ticker = row[ticker_col_idx].strip()
                        nome = row[nome_col_idx].strip()
                        if ticker and nome:
                            ativo = {'ticker': ticker, 'nome': nome, 'tipo': tipo}
                            self.lista_completa_ativos.append(ativo)
                            self.tickers_map[ticker] = nome
                            if DIFFLIB_AVAILABLE:
                                self.nomes_map[nome.lower()] = ticker
                    except IndexError:
                        # Pula linhas malformadas que não têm colunas suficientes
                        continue
            print(f"   - {filename} carregado com sucesso.")
        except Exception as e:
            print(f"❌ Erro ao processar o arquivo {filename}: {e}")

    def get_lista_completa_sugestoes(self):
        """Retorna a lista completa de ativos para as sugestões do front-end."""
        return self.lista_completa_ativos

    def sugerir_ticker(self, termo):
        """Retorna uma lista de sugestões de tickers baseada em um termo de busca."""
        termo = termo.lower()
        sugestoes = []
        tickers_vistos = set()

        for ativo in self.lista_completa_ativos:
            if termo in ativo['ticker'].lower() and ativo['ticker'] not in tickers_vistos:
                sugestoes.append(ativo)
                tickers_vistos.add(ativo['ticker'])
        
        if DIFFLIB_AVAILABLE:
            nomes_proximos = get_close_matches(termo, self.nomes_map.keys(), n=5, cutoff=0.6)
            for nome in nomes_proximos:
                ticker = self.nomes_map[nome]
                if ticker not in tickers_vistos:
                    sugestoes.append({'ticker': ticker, 'nome': self.tickers_map[ticker], 'tipo': 'EQUITY'})
                    tickers_vistos.add(ticker)
        
        return sugestoes[:5]

    def buscar_dados_ativo(self, ticker, periodo='1y', intervalo='1d'):
        """Busca dados de um ticker específico no yfinance, tratando o cache."""
        ticker = ticker.upper().strip()
        ticker_busca = self.traducoes.get(ticker, ticker if ticker.endswith('.SA') else f"{ticker}.SA")

        if ticker in self.cache and (datetime.now() - self.cache[ticker].get('timestamp', datetime.min)).total_seconds() < 900:
            print(f"⬇️  Retornando dados de '{ticker}' do cache.")
            return self.cache[ticker]['dados']

        try:
            print(f"☁️  Buscando dados de '{ticker}' ({ticker_busca}) na API...")
            ativo = yf.Ticker(ticker_busca)
            info = ativo.info
            
            if not info or info.get('regularMarketPrice') is None:
                if ticker_busca.endswith('.SA'):
                    print(f"   -> Primeira tentativa falhou. Tentando '{ticker}' sem '.SA'...")
                    ativo = yf.Ticker(ticker)
                    info = ativo.info
                    if not info or info.get('regularMarketPrice') is None:
                       raise ValueError("Dados de mercado não encontrados para o ticker.")
                else:
                    raise ValueError("Dados de mercado não encontrados para o ticker.")

            historico = ativo.history(period=periodo, interval=intervalo)
            
            if historico.empty:
                 raise ValueError("Histórico de preços não encontrado para o período.")
                 
            dados_completos = {'info': info, 'historico': historico}

            self.cache[ticker] = {'dados': dados_completos, 'timestamp': datetime.now()}
            print(f"✅ Dados de '{ticker}' obtidos e cacheados.")
            return dados_completos

        except Exception as e:
            print(f"❌ Erro ao buscar dados para '{ticker}': {e}")
            if 'sintetico' in str(e).lower() or ticker.endswith('34'):
                return self.criar_ativo_sintetico_brl(ticker)
            return None

    def get_dados_mercado(self):
        tickers = ['^BVSP', 'BRL=X', 'EURBRL=X', 'BTC-USD']
        dados_formatados = []
        for t in tickers:
            dados = self.buscar_dados_ativo(t.replace('^',''))
            if dados:
                info = dados['info']
                preco = info.get('regularMarketPrice')
                variacao_pct = info.get('regularMarketChangePercent')
                eh_positivo = variacao_pct is not None and variacao_pct >= 0
                
                item = {
                    'ticker': t,
                    'ticker_busca': t.replace('^',''),
                    'nome': self.nomes_formatados.get(t, info.get('shortName')),
                    'preco_brl': self.formatar_valor(preco, 'moeda', 'R$'),
                    'variacao': self.formatar_valor(variacao_pct, 'porcentagem'),
                    'eh_positivo': eh_positivo,
                    'quoteType': info.get('quoteType'),
                    'variacao_num': variacao_pct or 0
                }
                dados_formatados.append(item)
        return dados_formatados
    
    def get_mais_negociadas(self):
        tickers = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4']
        ativos = []
        for t in tickers:
            dados = self.buscar_dados_ativo(t)
            if dados:
                info = dados['info']
                ativos.append({
                    'ticker': info.get('symbol', t).replace('.SA',''),
                    'nome': info.get('longName', 'N/A'),
                    'preco': self.formatar_valor(info.get('regularMarketPrice'), 'moeda'),
                    'variacao': self.formatar_valor(info.get('regularMarketChangePercent'), 'porcentagem'),
                    'eh_positivo': info.get('regularMarketChange', 0) >= 0,
                    'quoteType': info.get('quoteType')
                })
        return ativos
        
    def get_top_dy(self):
        tickers = ['PETR4', 'VALE3', 'BBAS3', 'BBDC4', 'ITUB4', 'ELET3', 'GGBR4', 'CSNA3', 'CMIG4', 'CPLE6', 'TAEE11', 'TRPL4']
        resultados = []
        for t in tickers:
            dados = self.buscar_dados_ativo(t)
            if dados and dados['info'].get('dividendYield'):
                info = dados['info']
                resultados.append({
                    'ticker': t,
                    'preco': self.formatar_valor(info.get('regularMarketPrice'), 'moeda'),
                    'dy_formatado': self.formatar_valor(info.get('dividendYield'), 'porcentagem'),
                    'dy_num': info.get('dividendYield', 0),
                    'quoteType': info.get('quoteType')
                })
        return sorted(resultados, key=lambda x: x['dy_num'], reverse=True)

    def get_top_market_cap(self):
        tickers = ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'WEGE3', 'B3SA3', 'ABEV3', 'JBSS3', 'RENT3', 'SUZB3']
        resultados = []
        for t in tickers:
            dados = self.buscar_dados_ativo(t)
            if dados and dados['info'].get('marketCap'):
                info = dados['info']
                resultados.append({
                    'ticker': t,
                    'preco': self.formatar_valor(info.get('regularMarketPrice'), 'moeda'),
                    'market_cap_formatado': self.formatar_valor(info.get('marketCap'), 'bilhoes'),
                    'market_cap_num': info.get('marketCap', 0),
                    'quoteType': info.get('quoteType')
                })
        return sorted(resultados, key=lambda x: x['market_cap_num'], reverse=True)

    def criar_ativo_sintetico_brl(self, ticker_brl):
        """Tenta criar um ativo em BRL a partir de um ticker dos EUA (ex: AAPL -> AAPL34)."""
        if ticker_brl.endswith('34'):
            ticker_usd = ticker_brl[:-2]
            print(f"Sintetizando {ticker_brl} a partir de {ticker_usd} e BRL=X...")
            dados_usd = self.buscar_dados_ativo(ticker_usd)
            dados_cambio = self.buscar_dados_ativo('BRL=X')

            if dados_usd and dados_cambio:
                info_usd = dados_usd['info']
                hist_usd = dados_usd['historico']
                cambio_atual = dados_cambio['info']['regularMarketPrice']
                hist_cambio = dados_cambio['historico']['Close']
                
                info_sintetico = info_usd.copy()
                info_sintetico['currency'] = 'BRL'
                info_sintetico['longName'] = f"{info_usd.get('longName', ticker_usd)} (BDR)"
                info_sintetico['symbol'] = ticker_brl

                for key in ['regularMarketPrice', 'dayHigh', 'dayLow', 'open', 'previousClose', 'marketCap']:
                    if info_sintetico.get(key):
                        info_sintetico[key] *= cambio_atual
                
                df_merged = pd.concat([hist_usd, hist_cambio.rename('Cambio')], axis=1)
                df_merged['Cambio'].ffill(inplace=True)
                df_merged.dropna(subset=['Open'], inplace=True)
                for col in ['Open', 'High', 'Low', 'Close']:
                    df_merged[col] *= df_merged['Cambio']
                
                dados_sinteticos = {'info': info_sintetico, 'historico': df_merged.drop(columns=['Cambio'])}
                self.cache[ticker_brl] = {
                    'dados': dados_sinteticos,
                    'timestamp': datetime.now()
                }
                print(f"✅ Conversão de {ticker_usd} para BRL realizada com sucesso!")
                return dados_sinteticos

        return None

    def formatar_valor(self, valor, tipo='numero', moeda='R$'):
        if not isinstance(valor, (int, float)): return "N/D"
        try:
            if tipo == 'porcentagem': return f"{valor * 100:,.2f}%".replace('.',',')
            if tipo == 'bilhoes': return f"R$ {valor / 1e9:,.2f} Bi".replace('.',',')
            
            prefixo = f"{moeda} " if tipo == 'moeda' else ""
            return f"{prefixo}{valor:,.2f}".replace('.',',')
        except (TypeError, ValueError):
            return "N/D"

