import requests
from bs4 import BeautifulSoup
import re

class StatusInvestScraper:
    """
    Scraper para buscar dados do Status Invest (fonte brasileira confiável).
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.base_url = "https://statusinvest.com.br"
    
    def limpar_valor(self, texto):
        """Remove caracteres e converte para float."""
        if not texto:
            return None
        # Remove espaços, %, R$, e converte vírgula para ponto
        texto = texto.strip().replace('%', '').replace('R$', '').replace('.', '').replace(',', '.')
        try:
            return float(texto)
        except:
            return None
    
    def buscar_dividend_yield(self, ticker):
        """
        Busca o Dividend Yield do Status Invest.
        Retorna o valor em formato decimal (0.1631 = 16,31%)
        """
        # Remove .SA se existir
        ticker_limpo = ticker.replace('.SA', '').upper()
        
        try:
            # URL da ação no Status Invest
            url = f"{self.base_url}/acoes/{ticker_limpo.lower()}"
            
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                print(f"⚠️  Status Invest retornou código {response.status_code} para {ticker_limpo}")
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Procura pelo Dividend Yield
            # O Status Invest usa diferentes estruturas, vamos tentar várias
            
            # Método 1: Procurar por "DY" ou "Dividend Yield" em strong/span
            for elemento in soup.find_all(['strong', 'span', 'div']):
                texto = elemento.get_text(strip=True)
                if 'DY' in texto or 'Dividend Yield' in texto:
                    # Procura o valor próximo
                    parent = elemento.parent
                    if parent:
                        valor_texto = parent.get_text(strip=True)
                        # Extrai números com % do texto
                        match = re.search(r'(\d+[,.]?\d*)\s*%', valor_texto)
                        if match:
                            valor = self.limpar_valor(match.group(1))
                            if valor and 0 <= valor <= 50:  # Validação
                                print(f"✅ DY encontrado para {ticker_limpo}: {valor}%")
                                return valor / 100  # Retorna em decimal
            
            # Método 2: Procurar na estrutura de indicadores
            indicadores = soup.find_all(class_=re.compile(r'indicator|value|info'))
            for ind in indicadores:
                texto = ind.get_text(strip=True)
                if 'DY' in texto.upper():
                    match = re.search(r'(\d+[,.]?\d*)\s*%', texto)
                    if match:
                        valor = self.limpar_valor(match.group(1))
                        if valor and 0 <= valor <= 50:
                            print(f"✅ DY encontrado para {ticker_limpo}: {valor}%")
                            return valor / 100
            
            print(f"⚠️  Não foi possível encontrar DY no Status Invest para {ticker_limpo}")
            return None
            
        except requests.exceptions.Timeout:
            print(f"⚠️  Timeout ao buscar {ticker_limpo} no Status Invest")
            return None
        except Exception as e:
            print(f"⚠️  Erro ao buscar {ticker_limpo} no Status Invest: {e}")
            return None
    
    def buscar_dados_completos(self, ticker):
        """
        Busca dados completos de uma ação no Status Invest.
        Retorna um dicionário com os principais indicadores.
        """
        ticker_limpo = ticker.replace('.SA', '').upper()
        
        try:
            url = f"{self.base_url}/acoes/{ticker_limpo.lower()}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            dados = {
                'ticker': ticker_limpo,
                'dividend_yield': None,
                'p_l': None,
                'p_vp': None,
                'roe': None
            }
            
            # Extrai o DY
            dados['dividend_yield'] = self.buscar_dividend_yield(ticker)
            
            return dados
            
        except Exception as e:
            print(f"⚠️  Erro ao buscar dados completos de {ticker_limpo}: {e}")
            return None