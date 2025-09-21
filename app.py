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
    var_monetaria = info.get('regularMarketChange')
    var_percentual = info.get('regularMarketChangePercent')

    dados_formatados = {
        "ticker": info.get('symbol', 'N/D'),
        "nome": info.get('longName') or info.get('shortName', 'N/A'),
        "quoteType": quote_type,
        "preco_atual": fv(preco_atual, 'moeda'),
        "variacao_dia_abs": fv(var_monetaria, 'moeda'),
        "variacao_dia_pct": fv(var_percentual, 'porcentagem'),
        "eh_positivo": var_monetaria is not None and var_monetaria >= 0,
        "secoes": [],
        "historico_grafico": None
    }
    
    # Seções de indicadores (para Ações e FIIs)
    if quote_type in ['EQUITY', 'MUTUALFUND', 'ETF']:
        dados_formatados['secoes'] = [
            {"titulo": "Valuation", "indicadores": [
                {"label": "Dividend Yield", "value": fv(info.get('dividendYield'), 'porcentagem')},
                {"label": "P/L", "value": fv(info.get('trailingPE'))},
                {"label": "P/VP", "value": fv(info.get('priceToBook'))},
                {"label": "PSR", "value": fv(info.get('priceToSales'))},
                {"label": "Dividend Yield 12M", "value": fv(info.get('trailingAnnualDividendYield'), 'porcentagem')},
            ]},
            {"titulo": "Endividamento", "indicadores": [
                {"label": "Dív. Líquida / Patrimônio", "value": fv(info.get('debtToEquity'))},
                 {"label": "Dív. Líquida / EBITDA", "value": fv(info.get('debtToEbitda'))},
                {"label": "Liquidez Corrente", "value": fv(info.get('currentRatio'))},
            ]},
            {"titulo": "Eficiência", "indicadores": [
                {"label": "Margem Bruta", "value": fv(info.get('grossMargins'), 'porcentagem')},
                {"label": "Margem Ebitda", "value": fv(info.get('ebitdaMargins'), 'porcentagem')},
                {"label": "Margem Líquida", "value": fv(info.get('profitMargins'), 'porcentagem')},
            ]},
            {"titulo": "Rentabilidade", "indicadores": [
                {"label": "ROE", "value": fv(info.get('returnOnEquity'), 'porcentagem')},
                {"label": "ROA", "value": fv(info.get('returnOnAssets'), 'porcentagem')},
                {"label": "ROIC", "value": fv(info.get('returnOnCapital'))},
            ]}
        ]

    # Processamento do histórico para o gráfico
    if historico is not None and not historico.empty:
        # Assegura que o índice é DatetimeIndex
        if not isinstance(historico.index, pd.DatetimeIndex):
             historico.index = pd.to_datetime(historico.index)
        
        # Filtra por período se necessário (ex: '5d', '1mo')
        # ... lógica de filtragem de data se aplicável ...

        dados_formatados["historico_grafico"] = {
            "labels": historico.index.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
            "data": historico['Close'].round(2).tolist()
        }

    return dados_formatados
    

@app.route('/api/pesquisa/<termo>')
def pesquisar_ativo(termo):
    """Retorna os dados completos de um ativo ou uma lista de sugestões."""
    periodo = request.args.get('periodo', '1y')
    
    dados = vista_analyzer.buscar_dados_ativo(termo, periodo=periodo)
    if not dados:
        sugestoes = vista_analyzer.sugerir_ticker(termo)
        if sugestoes:
            # Se encontrou sugestões, busca os dados da primeira
            primeira_sugestao_ticker = sugestoes[0]['ticker']
            dados_sugestao = vista_analyzer.buscar_dados_ativo(primeira_sugestao_ticker, periodo=periodo)
            if dados_sugestao:
                return jsonify({
                    "tipo": "dados_completos",
                    "dados": formatar_dados_para_web(dados_sugestao['info'], dados_sugestao['historico'], vista_analyzer, periodo)
                })
        return jsonify({"erro": f"Ativo '{termo}' não encontrado."}), 404

    dados_formatados = formatar_dados_para_web(dados['info'], dados['historico'], vista_analyzer, periodo)
    return jsonify({
        "tipo": "dados_completos",
        "dados": dados_formatados
    })

@app.route('/api/ativos/lista')
def get_lista_ativos():
    """Retorna a lista completa de ativos para o front-end usar nas sugestões."""
    return jsonify(vista_analyzer.get_lista_completa_sugestoes())


@app.route('/api/homepage/destaques')
def get_destaques_homepage():
    """Busca e formata todos os dados necessários para a página inicial."""
    global cached_data, cache_timestamp
    
    # Verifica o cache
    if cached_data and (time.time() - cache_timestamp < CACHE_DURATION):
        print("Retornando destaques do cache.")
        return jsonify(cached_data)
        
    print("Buscando novos dados para destaques (cache expirado).")
    
    dados_mercado = vista_analyzer.get_dados_mercado()
    
    # Filtra e ordena para altas e baixas
    altas = sorted([d for d in dados_mercado if d.get('eh_positivo') == True], key=lambda x: x['variacao_num'], reverse=True)[:5]
    baixas = sorted([d for d in dados_mercado if d.get('eh_positivo') == False], key=lambda x: x['variacao_num'])[:5]
    
    # Busca os demais rankings
    maiores_dy = vista_analyzer.get_top_dy()[:5]
    maiores_market_cap = vista_analyzer.get_top_market_cap()[:5]
    mais_buscadas = vista_analyzer.get_mais_negociadas()[:4]

    # Monta o JSON de resposta
    response_data = {
        "mais_buscadas": mais_buscadas,
        "dados_mercado": dados_mercado[:4],
        "maiores_altas": altas,
        "maiores_baixas": baixas,
        "maiores_dy": maiores_dy,
        "maiores_market_cap": maiores_market_cap
    }

    # Atualiza o cache
    cached_data = response_data
    cache_timestamp = time.time()
    
    return jsonify(response_data)


@app.route('/api/ranking/<rankingType>')
def get_full_ranking(rankingType):
    """Retorna o ranking completo para um tipo específico com paginação."""
    cache_key = f"ranking_{rankingType}"
    
    # Verifica se os dados estão em cache e são recentes
    if cache_key in vista_analyzer.cache and (time.time() - vista_analyzer.cache[cache_key]['timestamp'] < 300):
        full_ranking = vista_analyzer.cache[cache_key]['data']
    else:
        # Lógica para buscar e processar os dados caso não estejam no cache
        if rankingType == 'altas':
            dados_brutos = vista_analyzer.get_dados_mercado()
            full_ranking = sorted([d for d in dados_brutos if d.get('eh_positivo') == True], key=lambda x: x['variacao_num'], reverse=True)
        elif rankingType == 'baixas':
            dados_brutos = vista_analyzer.get_dados_mercado()
            full_ranking = sorted([d for d in dados_brutos if d.get('eh_positivo') == False], key=lambda x: x['variacao_num'])
        elif rankingType == 'dy':
            full_ranking = vista_analyzer.get_top_dy()
        elif rankingType == 'market_cap':
            full_ranking = vista_analyzer.get_top_market_cap()
        else:
            return jsonify({"erro": "Tipo de ranking inválido"}), 404
        
        # Armazena no cache
        vista_analyzer.cache[cache_key] = {'data': full_ranking, 'timestamp': time.time()}

    # Paginação
    page = request.args.get('page', 1, type=int)
    items_per_page = 10
    start_index = (page - 1) * items_per_page
    end_index = start_index + items_per_page
    
    paginated_data = full_ranking[start_index:end_index]
    
    return jsonify(paginated_data)


@app.route('/api/comparar/<ticker1>/<ticker2>')
def comparar_ativos(ticker1, ticker2):
    periodo = request.args.get('periodo', '1y')
    
    dados1 = vista_analyzer.buscar_dados_ativo(ticker1, periodo=periodo)
    dados2 = vista_analyzer.buscar_dados_ativo(ticker2, periodo=periodo)

    if not dados1 or not dados2:
        return jsonify({"erro": "Um ou ambos os ativos não foram encontrados."}), 404

    info1, hist1 = dados1['info'], dados1['historico']
    info2, hist2 = dados2['info'], dados2['historico']

    indicadores_comparativos = []
    mapa_indicadores = {
        'P/L': ('trailingPE', 'numero', 'menor'),
        'P/VP': ('priceToBook', 'numero', 'menor'),
        'Dividend Yield': ('dividendYield', 'porcentagem', 'maior'),
        'ROE': ('returnOnEquity', 'porcentagem', 'maior'),
        'Margem Líquida': ('profitMargins', 'porcentagem', 'maior'),
        'Dív. Líquida / Patrimônio': ('debtToEquity', 'numero', 'menor')
    }

    for label, (key, tipo, melhor) in mapa_indicadores.items():
        v1_raw = info1.get(key)
        v2_raw = info2.get(key)
        winner = 0

        if isinstance(v1_raw, (int, float)) and isinstance(v2_raw, (int, float)):
            if melhor == 'maior':
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
    
    resultado = {
        "ativo1": {"ticker": ticker1.upper(), "nome": info1.get('longName', ''), "quoteType": info1.get('quoteType')},
        "ativo2": {"ticker": ticker2.upper(), "nome": info2.get('longName', ''), "quoteType": info2.get('quoteType')},
        "indicadores_comparativos": indicadores_comparativos,
        "historico_normalizado": historico_normalizado
    }
    
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
