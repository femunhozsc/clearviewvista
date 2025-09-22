import math
from flask import Flask, jsonify, request
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
app = Flask(__name__)
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
        'tipo_ativo': vista_instance.traducoes.get(quote_type),
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
            {'titulo': 'Indicadores de Eficiência', 'indicadores': [
                {'label': 'Marg. Bruta', 'value': fv(info.get('grossMargins'), 'porcentagem')}, {'label': 'Marg. EBITDA', 'value': fv(info.get('ebitdaMargins'), 'porcentagem')},
                {'label': 'Marg. Líquida', 'value': fv(info.get('profitMargins'), 'porcentagem')},
            ]},
            {'titulo': 'Indicadores de Rentabilidade', 'indicadores': [
                {'label': 'ROE', 'value': fv(info.get('returnOnEquity'), 'porcentagem')}, {'label': 'ROA', 'value': fv(info.get('returnOnAssets'), 'porcentagem')},
                {'label': 'ROIC', 'value': fv(info.get('returnOnAssets'), 'porcentagem')}, 
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
            
            fech_anterior = info.get('previousClose')
            var_monetaria = info.get('regularMarketChange')
            div_rate = info.get('trailingAnnualDividendRate')
            market_cap = info.get('marketCap')

            var_pct_ratio = (var_monetaria / fech_anterior) if var_monetaria is not None and fech_anterior and fech_anterior != 0 else 0.0
            dividend_yield_calculado = (div_rate / fech_anterior) if div_rate and fech_anterior and fech_anterior > 0 else 0.0
            
            if market_cap and info.get('regularMarketPrice') is not None:
                all_stocks_data.append({
                    'ticker': ticker, 'preco': info.get('regularMarketPrice'),
                    'variacao_num': var_pct_ratio, 'eh_positivo': var_pct_ratio >= 0,
                    'dividend_yield_num': dividend_yield_calculado,
                    'market_cap_num': market_cap,
                    'quoteType': info.get('quoteType') 
                })

    cached_data = all_stocks_data
    cache_timestamp = time.time()
    
    return cached_data

# --- ROTAS DA API ---
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
        return jsonify({"erro": "Tipo de ranking inválido"}), 404
    
    final_list = copy.deepcopy(sorted_list[:30])

    for item in final_list:
        item['preco'] = vista_analyzer.formatar_valor(item.get('preco'), tipo='moeda')
        item['variacao'] = vista_analyzer.formatar_valor(item.get('variacao_num', 0), 'porcentagem')
        item['dy_formatado'] = vista_analyzer.formatar_valor(item.get('dividend_yield_num', 0), 'porcentagem')
        item['market_cap_formatado'] = vista_analyzer.formatar_valor(item.get('market_cap_num', 0), 'bilhoes')

    return jsonify(final_list)


@app.route('/api/pesquisa/<string:termo_busca>')
def pesquisar_ativo(termo_busca):
    periodo = request.args.get('periodo', '1y')
    tickers_encontrados = vista_analyzer.pesquisar_ativo(termo_busca)
    tickers_validos = {t: d for t in tickers_encontrados if (d := vista_analyzer.buscar_dados_ativo(t))}
    if not tickers_validos:
        return jsonify({"erro": "Nenhum ativo encontrado"}), 404
    if len(tickers_validos) > 1:
        opcoes = [{'ticker': t.replace(".SA", ""), 'nome': d['info'].get('shortName', t)} for t, d in tickers_validos.items()]
        return jsonify({"tipo": "lista_opcoes", "dados": sorted(opcoes, key=lambda x: x['ticker'])})
    else:
        ticker_final = list(tickers_validos.keys())[0]
        dados_completos = tickers_validos[ticker_final]
        dados_formatados = formatar_dados_para_web(dados_completos['info'], dados_completos.get('historico'), vista_analyzer, periodo)
        return jsonify({"tipo": "dados_completos", "dados": dados_formatados})

@app.route('/api/comparar/<string:ticker1>/<string:ticker2>')
def comparar_ativos(ticker1, ticker2):
    periodo = request.args.get('periodo', '1y')
    
    ticker1_full_list = vista_analyzer.pesquisar_ativo(ticker1)
    ticker2_full_list = vista_analyzer.pesquisar_ativo(ticker2)
    
    if not ticker1_full_list or not ticker2_full_list:
         return jsonify({"erro": "Um ou ambos os tickers não foram encontrados."}), 404

    dados1 = vista_analyzer.buscar_dados_ativo(ticker1_full_list[0])
    dados2 = vista_analyzer.buscar_dados_ativo(ticker2_full_list[0])

    if not dados1 or not dados2:
        return jsonify({"erro": "Não foi possível obter dados para um ou ambos os ativos."}), 404

    info1, info2 = dados1['info'], dados2['info']
    hist1, hist2 = dados1.get('historico'), dados2.get('historico')
    
    ativo1_data = {'ticker': ticker1.upper(), 'nome': info1.get('shortName'), 'quoteType': info1.get('quoteType')}
    ativo2_data = {'ticker': ticker2.upper(), 'nome': info2.get('shortName'), 'quoteType': info2.get('quoteType')}

    indicadores_comparativos = []
    chaves_indicadores = [
        ('regularMarketPrice', 'Preço Atual', 'moeda', False), ('marketCap', 'Valor de Mercado', 'bilhoes', True),
        ('trailingPE', 'P/L', 'numero', False), ('priceToBook', 'P/VP', 'numero', False),
        ('trailingAnnualDividendYield', 'Dividend Yield', 'porcentagem', True),
        ('returnOnEquity', 'ROE', 'porcentagem', True), ('debtToEquity', 'Dívida/Patrimônio', 'numero', False)
    ]
    for chave, label, tipo, high_is_better in chaves_indicadores:
        v1_raw = info1.get(chave)
        v2_raw = info2.get(chave)
        
        winner = 0
        if isinstance(v1_raw, (int, float)) and isinstance(v2_raw, (int, float)):
            if high_is_better:
                if v1_raw > v2_raw: winner = 1
                elif v2_raw > v1_raw: winner = 2
            else: 
                if v1_raw < v2_raw: winner = 1
                elif v2_raw < v1_raw: winner = 2
        
        indicadores_comparativos.append({
            'label': label,
            'valor1': vista_analyzer.formatar_valor(v1_raw, tipo),
            'valor2': vista_analyzer.formatar_valor(v2_raw, tipo),
            'winner': winner
        })

    if hist1 is None or hist2 is None or hist1.empty or hist2.empty:
        return jsonify({"erro": "Dados históricos insuficientes para comparação."}), 404
        
    hist_merged = pd.concat([hist1['Close'].rename(ticker1), hist2['Close'].rename(ticker2)], axis=1).dropna()
    
    if hist_merged.empty:
        return jsonify({"erro": "Não há dados históricos sobrepostos para o período selecionado."}), 400

    normalized_hist = (hist_merged / hist_merged.iloc[0]) * 100
    
    historico_normalizado = {
        'labels': normalized_hist.index.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
        'datasets': {
            ticker1.upper(): normalized_hist[ticker1].tolist(),
            ticker2.upper(): normalized_hist[ticker2].tolist()
        }
    }
    
    return jsonify({
        'ativo1': ativo1_data,
        'ativo2': ativo2_data,
        'indicadores_comparativos': indicadores_comparativos,
        'historico_normalizado': historico_normalizado
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
