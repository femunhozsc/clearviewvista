import math
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

def calcular_indicadores_avancados(info):
    """Calcula indicadores financeiros avançados a partir dos dados do yfinance."""
    indicadores = {}
    
    # Dados base
    preco_atual = info.get('regularMarketPrice')
    market_cap = info.get('marketCap')
    total_assets = info.get('totalAssets')
    total_revenue = info.get('totalRevenue')
    ebitda = info.get('ebitda')
    net_income = info.get('netIncomeToCommon')
    total_equity = info.get('totalStockholderEquity')
    total_debt = info.get('totalDebt')
    dividends_paid = info.get('dividendsPaid') or info.get('trailingAnnualDividendRate')
    shares_outstanding = info.get('sharesOutstanding')
    
    # LPA (Lucro Por Ação) - Earnings Per Share
    lpa = info.get('trailingEps')
    if not lpa and net_income and shares_outstanding and shares_outstanding > 0:
        lpa = net_income / shares_outstanding
    indicadores['lpa'] = lpa
    
    # VPA (Valor Patrimonial por Ação) - Book Value Per Share
    vpa = info.get('bookValue')
    if not vpa and total_equity and shares_outstanding and shares_outstanding > 0:
        vpa = total_equity / shares_outstanding
    indicadores['vpa'] = vpa
    
    # Dividend Yield CORRETO - usando preço atual
    div_rate = info.get('trailingAnnualDividendRate')
    if div_rate and preco_atual and preco_atual > 0:
        indicadores['dividend_yield'] = div_rate / preco_atual
    else:
        indicadores['dividend_yield'] = info.get('dividendYield', 0)
    
    # P/Ativo Total
    if market_cap and total_assets and total_assets > 0:
        indicadores['p_ativo_total'] = market_cap / total_assets
    
    # Giro de Ativos
    if total_revenue and total_assets and total_assets > 0:
        indicadores['giro_ativos'] = total_revenue / total_assets
    
    # ROIC (Return on Invested Capital) CORRETO
    # ROIC = NOPAT / Invested Capital
    # NOPAT = EBIT * (1 - Tax Rate)
    # Invested Capital = Total Equity + Total Debt
    if ebitda and total_equity and total_debt:
        # Aproximação: usando EBITDA como proxy para EBIT
        tax_rate = 0.34  # Taxa de imposto aproximada no Brasil
        nopat = ebitda * (1 - tax_rate)
        invested_capital = total_equity + total_debt
        if invested_capital > 0:
            indicadores['roic'] = nopat / invested_capital
    
    # Payout (Percentual do lucro distribuído como dividendos)
    if dividends_paid and net_income and net_income > 0:
        # dividendsPaid geralmente é negativo no yfinance
        payout = abs(dividends_paid) / net_income
        indicadores['payout'] = min(payout, 1.0)  # Limita a 100%
    
    # Valor de Graham
    if lpa and vpa and lpa > 0 and vpa > 0:
        indicadores['valor_graham'] = math.sqrt(22.5 * lpa * vpa)
    
    # Preço Teto (Bazin) - assumindo 6% de yield mínimo
    if div_rate and div_rate > 0:
        indicadores['preco_teto'] = div_rate / 0.06
    
    # P/EBIT
    if market_cap and ebitda and ebitda > 0:
        indicadores['p_ebit'] = market_cap / ebitda
    
    # EV/EBIT
    enterprise_value = info.get('enterpriseValue')
    if enterprise_value and ebitda and ebitda > 0:
        indicadores['ev_ebit'] = enterprise_value / ebitda
    
    # Margem EBIT
    if ebitda and total_revenue and total_revenue > 0:
        indicadores['margem_ebit'] = ebitda / total_revenue
    
    return indicadores

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
    
    # Calcula indicadores avançados
    indicadores_calc = calcular_indicadores_avancados(info)

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
                {'label': 'Dividend Yield', 'value': fv(indicadores_calc.get('dividend_yield'), 'porcentagem')},
                {'label': 'P/L', 'value': fv(info.get('trailingPE'))},
                {'label': 'P/VP', 'value': fv(info.get('priceToBook'))},
                {'label': 'EV/EBITDA', 'value': fv(info.get('enterpriseToEbitda'))},
                {'label': 'P/Ativos', 'value': fv(indicadores_calc.get('p_ativo_total'))},
                {'label': 'P/EBIT', 'value': fv(indicadores_calc.get('p_ebit'))},
                {'label': 'EV/EBIT', 'value': fv(indicadores_calc.get('ev_ebit'))},
                {'label': 'Valor Graham', 'value': fv(indicadores_calc.get('valor_graham'), 'moeda')},
                {'label': 'Preço Teto (Bazin)', 'value': fv(indicadores_calc.get('preco_teto'), 'moeda')},
            ]},
            {'titulo': 'Indicadores de Endividamento', 'indicadores': [
                {'label': 'Liquidez Corrente', 'value': fv(info.get('currentRatio'))},
                {'label': 'Dív. Bruta / Patrimônio', 'value': fv(info.get('debtToEquity'))},
            ]},
            {'titulo': 'Indicadores de Eficiência', 'indicadores': [
                {'label': 'Marg. Bruta', 'value': fv(info.get('grossMargins'), 'porcentagem')},
                {'label': 'Marg. EBITDA', 'value': fv(info.get('ebitdaMargins'), 'porcentagem')},
                {'label': 'Marg. EBIT', 'value': fv(indicadores_calc.get('margem_ebit'), 'porcentagem')},
                {'label': 'Marg. Líquida', 'value': fv(info.get('profitMargins'), 'porcentagem')},
                {'label': 'Giro Ativos', 'value': fv(indicadores_calc.get('giro_ativos'))},
            ]},
            {'titulo': 'Indicadores de Rentabilidade', 'indicadores': [
                {'label': 'ROE', 'value': fv(info.get('returnOnEquity'), 'porcentagem')},
                {'label': 'ROA', 'value': fv(info.get('returnOnAssets'), 'porcentagem')},
                {'label': 'ROIC', 'value': fv(indicadores_calc.get('roic'), 'porcentagem')},
                {'label': 'LPA', 'value': fv(indicadores_calc.get('lpa'), 'moeda')},
                {'label': 'VPA', 'value': fv(indicadores_calc.get('vpa'), 'moeda')},
                {'label': 'Payout', 'value': fv(indicadores_calc.get('payout'), 'porcentagem')},
            ]}
        ])
    return dados_formatados

def get_dados_rankings_com_cache():
    """Busca os dados para os rankings, utilizando o cache se for válido."""
    global cached_data, cache_timestamp
    
    if time.time() - cache_timestamp < CACHE_DURATION and cached_data is not None:
        print("Servindo dados do cache.")
        return cached_data

    print("Cache expirado ou inexistente. Buscando novos dados...")
    ibov_tickers = [
        'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'ABEV3', 'WEGE3', 'MGLU3',
        'PRIO3', 'SUZB3', 'RENT3', 'EQTL3', 'JBSS3', 'RAIL3', 'CSAN3', 'EMBR3',
        'LREN3', 'GGBR4', 'CMIG4', 'ITSA4', 'BBSE3', 'CSMG3', 'TRPL4', 'TAEE11',
        'UGPA3', 'VIVT3', 'TIMS3', 'ELET3', 'CPLE6', 'SANB11', 'HAPV3', 'RDOR3'
    ]
    
    all_stocks_data = []
    for ticker in ibov_tickers:
        dados = vista_analyzer.buscar_dados_ativo(f"{ticker}.SA")
        if dados and dados.get('info'):
            info = dados['info']
            
            preco_atual = info.get('regularMarketPrice')
            fech_anterior = info.get('previousClose')
            var_monetaria = info.get('regularMarketChange')
            market_cap = info.get('marketCap')

            var_pct_ratio = (var_monetaria / fech_anterior) if var_monetaria is not None and fech_anterior and fech_anterior != 0 else 0.0
            
            # Dividend Yield CORRETO - usando preço atual
            div_rate = info.get('trailingAnnualDividendRate')
            dividend_yield_calculado = (div_rate / preco_atual) if div_rate and preco_atual and preco_atual > 0 else 0.0
            
            if market_cap and preco_atual is not None:
                all_stocks_data.append({
                    'ticker': ticker, 'preco': preco_atual,
                    'variacao_num': var_pct_ratio, 'eh_positivo': var_pct_ratio >= 0,
                    'dividend_yield_num': dividend_yield_calculado,
                    'market_cap_num': market_cap,
                    'quoteType': info.get('quoteType') 
                })

    cached_data = all_stocks_data
    cache_timestamp = time.time()
    
    return cached_data

# --- ROTAS DA API ---
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/ativos/lista')
def get_lista_ativos():
    return jsonify(vista_analyzer.lista_completa_ativos)

@app.route('/api/homepage/destaques')
def get_homepage_data():
    """Fornece os top 5 de cada ranking para a página inicial."""
    acoes_populares = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'MGLU3', 'WEGE3', 'ABEV3']
    
    mais_buscadas = []
    for ticker in acoes_populares:
        dados = vista_analyzer.buscar_dados_ativo(f"{ticker}.SA")
        if dados and dados.get('info'):
            info = dados['info']
            var_pct_ratio = (info.get('regularMarketChange', 0) / info.get('previousClose')) if info.get('previousClose') else 0
            mais_buscadas.append({
                'ticker': ticker, 'nome': info.get('shortName'),
                'preco': vista_analyzer.formatar_valor(info.get('regularMarketPrice'), tipo='moeda'),
                'variacao': vista_analyzer.formatar_valor(var_pct_ratio, 'porcentagem'),
                'eh_positivo': var_pct_ratio >= 0,
                'quoteType': info.get('quoteType')
            })
    
    all_stocks = get_dados_rankings_com_cache()

    def format_and_copy(stock_list, value_key, new_value_key, format_type):
        copied_list = copy.deepcopy(stock_list)
        for item in copied_list:
            item['preco'] = vista_analyzer.formatar_valor(item.get('preco'), tipo='moeda')
            item[new_value_key] = vista_analyzer.formatar_valor(item.get(value_key, 0), format_type)
        return copied_list
    
    maiores_altas_raw = sorted([s for s in all_stocks if s.get('variacao_num', 0) > 0], key=lambda x: x['variacao_num'], reverse=True)[:5]
    maiores_baixas_raw = sorted([s for s in all_stocks if s.get('variacao_num', 0) < 0], key=lambda x: x['variacao_num'])[:5]
    maiores_dy_raw = sorted([s for s in all_stocks if s.get('dividend_yield_num', 0) > 0], key=lambda x: x.get('dividend_yield_num', 0), reverse=True)[:5]
    maiores_market_cap_raw = sorted([s for s in all_stocks if s.get('market_cap_num', 0) > 0], key=lambda x: x.get('market_cap_num', 0), reverse=True)[:5]

    maiores_altas = format_and_copy(maiores_altas_raw, 'variacao_num', 'variacao', 'porcentagem')
    maiores_baixas = format_and_copy(maiores_baixas_raw, 'variacao_num', 'variacao', 'porcentagem')
    maiores_dy = format_and_copy(maiores_dy_raw, 'dividend_yield_num', 'dy_formatado', 'porcentagem')
    maiores_market_cap = format_and_copy(maiores_market_cap_raw, 'market_cap_num', 'market_cap_formatado', 'bilhoes')

    # Busca dados para os cards de mercado
    dados_mercado = []
    mercado_map_resiliente = {
        'BTC': {'ticker_brl': 'BTC-BRL', 'ticker_usd': 'BTC-USD', 'nome': 'Bitcoin'},
        'ETH': {'ticker_brl': 'ETH-BRL', 'ticker_usd': 'ETH-USD', 'nome': 'Ethereum'},
        'USDBRL': {'ticker_brl': 'USDBRL=X', 'nome': 'Dólar'},
        'EURBRL': {'ticker_brl': 'EURBRL=X', 'nome': 'Euro'},
        'IFIX': {'ticker_brl': '^IFIX', 'nome': 'IFIX'}
    }

    for key, val in mercado_map_resiliente.items():
        dados_brl = vista_analyzer.buscar_dados_ativo(val['ticker_brl'])
        if dados_brl and dados_brl.get('info'):
            info_brl = dados_brl['info']
            var_pct_ratio = (info_brl.get('regularMarketChange', 0) / info_brl.get('previousClose')) if info_brl.get('previousClose') else 0.0
            
            preco_formatado = 'moeda'
            if key == 'IFIX':
                preco_formatado = 'numero'
            
            ativo_mercado = {
                'ticker': key, 'nome': val['nome'], 'quoteType': info_brl.get('quoteType'),
                'preco_brl': vista_analyzer.formatar_valor(info_brl.get('regularMarketPrice'), tipo=preco_formatado, moeda='R$'),
                'eh_positivo': var_pct_ratio >= 0,
                'variacao': vista_analyzer.formatar_valor(var_pct_ratio, 'porcentagem'),
                'ticker_busca': val['ticker_brl']
            }

            if 'ticker_usd' in val:
                dados_usd = vista_analyzer.buscar_dados_ativo(val['ticker_usd'])
                if dados_usd and dados_usd.get('info'):
                    ativo_mercado['preco_usd'] = vista_analyzer.formatar_valor(dados_usd['info'].get('regularMarketPrice'), tipo='moeda', moeda='US$')
            
            dados_mercado.append(ativo_mercado)
    
    dados_mercado = dados_mercado[:4]


    return jsonify({
        'mais_buscadas': mais_buscadas,
        'maiores_altas': maiores_altas,
        'maiores_baixas': maiores_baixas,
        'maiores_dy': maiores_dy,
        'maiores_market_cap': maiores_market_cap,
        'dados_mercado': dados_mercado
    })

@app.route('/api/ranking/<string:ranking_type>')
def get_ranking_completo(ranking_type):
    all_stocks = get_dados_rankings_com_cache()
    
    if ranking_type == 'altas':
        filtered_list = [s for s in all_stocks if s.get('variacao_num', 0) > 0]
        sorted_list = sorted(filtered_list, key=lambda x: x.get('variacao_num', 0), reverse=True)
    elif ranking_type == 'baixas':
        filtered_list = [s for s in all_stocks if s.get('variacao_num', 0) < 0]
        sorted_list = sorted(filtered_list, key=lambda x: x.get('variacao_num', 0))
    elif ranking_type == 'dy':
        filtered_list = [s for s in all_stocks if s.get('dividend_yield_num', 0) > 0]
        sorted_list = sorted(filtered_list, key=lambda x: x.get('dividend_yield_num', 0), reverse=True)
    elif ranking_type == 'market_cap':
        filtered_list = [s for s in all_stocks if s.get('market_cap_num', 0) > 0]
        sorted_list = sorted(filtered_list, key=lambda x: x.get('market_cap_num', 0), reverse=True)
    else:
        return jsonify({'erro': 'Tipo de ranking inválido'}), 400

    # Formata os dados para exibição
    formatted_list = []
    for item in sorted_list:
        formatted_item = {
            'ticker': item['ticker'],
            'preco': vista_analyzer.formatar_valor(item.get('preco'), tipo='moeda'),
            'variacao': vista_analyzer.formatar_valor(item.get('variacao_num', 0), 'porcentagem'),
            'eh_positivo': item.get('eh_positivo', False),
            'nome': vista_analyzer.tickers_map.get(f"{item['ticker']}.SA") or item['ticker'],
            'quoteType': item.get('quoteType')
        }
        if ranking_type == 'dy':
            formatted_item['dy_formatado'] = vista_analyzer.formatar_valor(item.get('dividend_yield_num', 0), 'porcentagem')
        elif ranking_type == 'market_cap':
            formatted_item['market_cap_formatado'] = vista_analyzer.formatar_valor(item.get('market_cap_num', 0), 'bilhoes')
        formatted_list.append(formatted_item)

    return jsonify(formatted_list)

@app.route('/api/pesquisa/<string:termo>')
def pesquisar_ativo_api(termo):
    if not termo: return jsonify({'erro': 'Termo de busca vazio'}), 400

    tickers_encontrados = vista_analyzer.pesquisar_ativo(termo)
    if not tickers_encontrados:
        return jsonify({'erro': 'Ativo não encontrado'}), 404

    if len(tickers_encontrados) > 1:
        # Retorna uma lista de opções para o front-end escolher
        opcoes = []
        for t in tickers_encontrados:
            info = vista_analyzer.buscar_dados_ativo(t)
            if info and info.get('info'):
                opcoes.append({
                    'ticker': t.replace(".SA", ""),
                    'nome': info['info'].get('shortName') or info['info'].get('longName') or t.replace(".SA", ""),
                    'tipo': vista_analyzer.traducoes.get(info['info'].get('quoteType'))
                })
        return jsonify({'tipo': 'lista_opcoes', 'dados': opcoes})
    else:
        # Retorna os dados completos do ativo
        ticker_final = tickers_encontrados[0]
        periodo = request.args.get('periodo', '1y')
        dados_completos = vista_analyzer.buscar_dados_ativo(ticker_final)
        if dados_completos:
            info = dados_completos['info']
            historico = dados_completos['historico']
            
            formatted_data = formatar_dados_para_web(info, historico, vista_analyzer, periodo)
            return jsonify({'tipo': 'dados_completos', 'dados': formatted_data})
        else:
            return jsonify({'erro': 'Não foi possível obter dados para o ativo'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)