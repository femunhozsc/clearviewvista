from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import time
import copy

# Importa a sua classe ClearviewVista do arquivo vista.py
from vista import ClearviewVista

# Cria a instância da sua classe.
print("Iniciando o Clearview Vista...")
vista_analyzer = ClearviewVista()
print("Clearview Vista carregado e pronto.")

# Cria a aplicação Flask
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# --- Sistema de Cache Simples ---
cached_data = None
cache_timestamp = 0
CACHE_DURATION = 900 # 15 minutos

def formatar_dados_para_web(info, historico, vista_instance, periodo_req='1y'):
    """Formata os dados brutos em um dicionário estruturado para o front-end."""
    quote_type = info.get('quoteType')
    moeda_simbolo = 'R$' if info.get('currency') == 'BRL' else f"{info.get('currency')} "

    def fv(valor, tipo='numero', moeda=moeda_simbolo):
        return vista_instance.formatar_valor(valor, tipo, moeda)

    preco_atual = info.get('regularMarketPrice')
    fech_anterior = info.get('previousClose')
    var_monetaria = info.get('regularMarketChange', preco_atual - fech_anterior if preco_atual and fech_anterior else 0)
    var_percentual = (var_monetaria / fech_anterior) if var_monetaria is not None and fech_anterior and fech_anterior != 0 else 0
    div_rate = info.get('trailingAnnualDividendRate')
    dividend_yield_calculado = (div_rate / fech_anterior) if div_rate and fech_anterior and fech_anterior > 0 else 0.0
    lpa, vpa = info.get('trailingEps'), info.get('bookValue')
    valor_graham = math.sqrt(22.5 * lpa * vpa) if lpa and vpa and lpa > 0 and vpa > 0 else None
    preco_teto = div_rate / 0.06 if div_rate and div_rate > 0 else None

    historico_grafico = None
    if historico is not None and not historico.empty:
        periodos_map = {
            '1m': historico.last('30D'), '3m': historico.last('90D'), '6m': historico.last('180D'),
            '1y': historico.last('365D'), '5y': historico.last('1825D'), 'max': historico
        }
        hist_selecionado = periodos_map.get(periodo_req, historico.last('365D'))
        historico_grafico = {
            'labels': hist_selecionado.index.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
            'data': hist_selecionado['Close'].tolist()
        }

    dados_formatados = {
        'nome': info.get('longName') or info.get('shortName'),
        'ticker': info.get('symbol', '').replace(".SA", ""),
        'tipo_ativo': vista_analyzer.traducoes.get(quote_type),
        'quoteType': quote_type,
        'preco_atual': fv(preco_atual, 'moeda'),
        'variacao_dia_pct': fv(var_percentual, 'porcentagem'),
        'variacao_dia_abs': fv(var_monetaria, 'moeda'),
        'eh_positivo': var_percentual >= 0,
        'historico_grafico': historico_grafico,
        'secoes': []
    }

    if quote_type == 'EQUITY':
        dados_formatados['secoes'].extend([
            {'titulo': 'Indicadores de Valuation', 'indicadores': [
                {'label': 'Dividend Yield', 'value': fv(dividend_yield_calculado, 'porcentagem')}, {'label': 'P/L', 'value': fv(info.get('trailingPE'))},
                {'label': 'P/VP', 'value': fv(info.get('priceToBook'))}, {'label': 'EV/EBITDA', 'value': fv(info.get('enterpriseToEbitda'))},
                {'label': 'P/Ativos', 'value': fv(info.get('priceToSalesTrailing12Months'))}, {'label': 'Valor Graham', 'value': fv(valor_graham, 'moeda')},
                {'label': 'Preço Teto (Bazin)', 'value': fv(preco_teto, 'moeda')},
            ]},
            {'titulo': 'Indicadores de Endividamento', 'indicadores': [
                {'label': 'Liquidez Corrente', 'value': fv(info.get('currentRatio'))}, {'label': 'Dív. Bruta / Patrimônio', 'value': fv(info.get('debtToEquity'))},
            ]},