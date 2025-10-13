
import sys
import os

# Adiciona o diretório pai ao PATH para que vista.py possa ser importado
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from vista import ClearviewVista

def run_tests():
    vista = ClearviewVista()

    test_tickers = [
        "ITUB4.SA",  # Exemplo de ação brasileira com dividendos
        "PETR4.SA",  # Outro exemplo de ação brasileira com dividendos
        "MGLU3.SA",  # Exemplo de ação brasileira sem dividendos ou com DY baixo
        "AAPL",      # Exemplo de ação americana com dividendos
        "MSFT"       # Outro exemplo de ação americana com dividendos
    ]

    print("\n--- Iniciando testes de Dividend Yield ---")

    for ticker in test_tickers:
        print(f"\nBuscando dados para {ticker}")
        dados_ativo = vista.buscar_dados_ativo(ticker)

        if dados_ativo and "info" in dados_ativo:
            info = dados_ativo["info"]
            dy = info.get("dividendYield")
            
            print(f"  Ticker: {ticker}")
            print(f"  Nome da Empresa: {info.get('longName', 'N/D')}")
            print(f"  Preço Atual: {info.get('regularMarketPrice', 'N/D')}")
            print(f"  Dividend Rate (Anual): {info.get('dividendRate', 'N/D')}")
            print(f"  Dividend Yield (Calculado/Obtido): {dy * 100:.2f}%" if isinstance(dy, (int, float)) else f"  Dividend Yield: {dy}")
        else:
            print(f"  Não foi possível obter dados para {ticker}")

    print("\n--- Testes de Dividend Yield Concluídos ---")

if __name__ == "__main__":
    run_tests()

