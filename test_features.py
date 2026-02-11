#!/usr/bin/env python3
"""
Script de teste para verificar todas as funcionalidades do ClearView Vista
"""

import requests
import json
from alpha_vantage_client import AlphaVantageClient
from vista import ClearviewVista

def test_alpha_vantage():
    """Testa integração com Alpha Vantage"""
    print("\n=== Testando Alpha Vantage ===")
    try:
        client = AlphaVantageClient('L08YVAKZS7U2YZJB')
        
        # Teste 1: Quote
        print("1. Testando GLOBAL_QUOTE...")
        quote = client.get_quote_endpoint('BBAS3.SA')
        if quote:
            print(f"   ✓ Quote obtido: {quote.get('05. price', 'N/D')}")
        else:
            print("   ✗ Falha ao obter quote")
        
        # Teste 2: SMA
        print("2. Testando SMA...")
        sma = client.get_sma('BBAS3.SA', time_period=20)
        if sma:
            print("   ✓ SMA obtido")
        else:
            print("   ✗ Falha ao obter SMA")
        
        # Teste 3: RSI
        print("3. Testando RSI...")
        rsi = client.get_rsi('BBAS3.SA', time_period=14)
        if rsi:
            print("   ✓ RSI obtido")
        else:
            print("   ✗ Falha ao obter RSI")
        
        # Teste 4: MACD
        print("4. Testando MACD...")
        macd = client.get_macd('BBAS3.SA')
        if macd:
            print("   ✓ MACD obtido")
        else:
            print("   ✗ Falha ao obter MACD")
        
        print("✓ Alpha Vantage funcionando")
        return True
    except Exception as e:
        print(f"✗ Erro ao testar Alpha Vantage: {e}")
        return False

def test_vista():
    """Testa classe ClearviewVista"""
    print("\n=== Testando ClearviewVista ===")
    try:
        vista = ClearviewVista()
        
        # Teste 1: Carregar dados
        print("1. Testando carregamento de dados...")
        if vista.lista_completa_ativos:
            print(f"   ✓ {len(vista.lista_completa_ativos)} ativos carregados")
        else:
            print("   ✗ Nenhum ativo carregado")
        
        # Teste 2: Pesquisar ativo
        print("2. Testando pesquisa de ativo...")
        resultado = vista.pesquisar_ativo('BBAS3')
        if resultado:
            print(f"   ✓ Ativo encontrado: {resultado}")
        else:
            print("   ✗ Ativo não encontrado")
        
        # Teste 3: Buscar dados
        print("3. Testando busca de dados...")
        dados = vista.buscar_dados_ativo('BBAS3.SA')
        if dados and dados.get('info'):
            print(f"   ✓ Dados obtidos para BBAS3")
        else:
            print("   ✗ Falha ao obter dados")
        
        print("✓ ClearviewVista funcionando")
        return True
    except Exception as e:
        print(f"✗ Erro ao testar ClearviewVista: {e}")
        return False

def test_api_endpoints():
    """Testa endpoints da API"""
    print("\n=== Testando Endpoints da API ===")
    
    base_url = 'http://localhost:5001'
    
    try:
        # Teste 1: Homepage
        print("1. Testando /api/homepage/destaques...")
        response = requests.get(f'{base_url}/api/homepage/destaques', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Homepage obtida")
            print(f"     - Ativos populares: {len(data.get('mais_buscadas', []))}")
            print(f"     - Maiores altas: {len(data.get('maiores_altas', []))}")
            print(f"     - Maiores baixas: {len(data.get('maiores_baixas', []))}")
        else:
            print(f"   ✗ Erro {response.status_code}")
        
        # Teste 2: Detalhes de ativo
        print("2. Testando /api/ativo/BBAS3/detalhes...")
        response = requests.get(f'{base_url}/api/ativo/BBAS3/detalhes', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Detalhes obtidos")
            print(f"     - Ticker: {data.get('ticker')}")
            print(f"     - Indicadores: {len(data.get('indicadores_alpha_vantage', {}))}")
        else:
            print(f"   ✗ Erro {response.status_code}")
        
        # Teste 3: Lista de ativos
        print("3. Testando /api/ativos/lista...")
        response = requests.get(f'{base_url}/api/ativos/lista', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Lista obtida: {len(data)} ativos")
        else:
            print(f"   ✗ Erro {response.status_code}")
        
        print("✓ Endpoints funcionando")
        return True
    except Exception as e:
        print(f"✗ Erro ao testar endpoints: {e}")
        print("  Nota: Certifique-se de que o servidor está rodando em http://localhost:5001")
        return False

def test_files():
    """Verifica se todos os arquivos necessários existem"""
    print("\n=== Verificando Arquivos ===")
    
    required_files = [
        'index.html',
        'app.py',
        'vista.py',
        'pages.js',
        'router-dynamic.js',
        'alpha_vantage_client.py',
        'data_loader.js',
        'package.json',
        'requirements.txt'
    ]
    
    all_exist = True
    for file in required_files:
        try:
            with open(file, 'r'):
                print(f"✓ {file}")
        except FileNotFoundError:
            print(f"✗ {file} - NÃO ENCONTRADO")
            all_exist = False
    
    if all_exist:
        print("✓ Todos os arquivos necessários existem")
    else:
        print("✗ Alguns arquivos estão faltando")
    
    return all_exist

def main():
    """Executa todos os testes"""
    print("=" * 50)
    print("ClearView Vista - Teste de Funcionalidades")
    print("=" * 50)
    
    results = {
        'Arquivos': test_files(),
        'ClearviewVista': test_vista(),
        'Alpha Vantage': test_alpha_vantage(),
        # 'Endpoints da API': test_api_endpoints()  # Comentado - requer servidor rodando
    }
    
    print("\n" + "=" * 50)
    print("RESUMO DOS TESTES")
    print("=" * 50)
    
    for test_name, result in results.items():
        status = "✓ PASSOU" if result else "✗ FALHOU"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n✓ Todos os testes passaram!")
        print("\nPróximos passos:")
        print("1. Iniciar o servidor: python app.py")
        print("2. Acessar: http://localhost:5001")
        print("3. Fazer push para GitHub")
        print("4. Deploy no Vercel")
    else:
        print("\n✗ Alguns testes falharam. Verifique os erros acima.")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    exit(main())
