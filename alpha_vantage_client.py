import requests
import pandas as pd
from datetime import datetime
import time

class AlphaVantageClient:
    """
    Cliente para integração com Alpha Vantage API.
    Fornece dados de preços, indicadores técnicos e fundamentais.
    """
    
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        self.cache = {}
        self.rate_limit_delay = 0.25  # 5 requisições por segundo
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Implementa rate limiting para respeitar limites da API."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - elapsed)
        self.last_request_time = time.time()
    
    def _make_request(self, params):
        """Faz requisição à API com rate limiting."""
        self._rate_limit()
        params['apikey'] = self.api_key
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Erro ao fazer requisição Alpha Vantage: {e}")
            return None
    
    def get_quote_endpoint(self, symbol):
        """
        Obtém dados de cotação em tempo real.
        Retorna: preço, variação, volume, etc.
        """
        cache_key = f"quote_{symbol}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol
        }
        
        data = self._make_request(params)
        if data and 'Global Quote' in data:
            quote = data['Global Quote']
            if quote:
                self.cache[cache_key] = quote
                return quote
        return None
    
    def get_intraday(self, symbol, interval='60min'):
        """
        Obtém dados intraday (últimas 100 observações).
        Intervals: 1min, 5min, 15min, 30min, 60min
        """
        cache_key = f"intraday_{symbol}_{interval}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        params = {
            'function': 'TIME_SERIES_INTRADAY',
            'symbol': symbol,
            'interval': interval,
            'outputsize': 'full'
        }
        
        data = self._make_request(params)
        if data:
            self.cache[cache_key] = data
            return data
        return None
    
    def get_daily(self, symbol, outputsize='full'):
        """
        Obtém dados diários (últimos 20 anos).
        outputsize: 'compact' (últimos 100) ou 'full' (todos)
        """
        cache_key = f"daily_{symbol}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'outputsize': outputsize
        }
        
        data = self._make_request(params)
        if data:
            self.cache[cache_key] = data
            return data
        return None
    
    def get_weekly(self, symbol):
        """Obtém dados semanais."""
        cache_key = f"weekly_{symbol}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        params = {
            'function': 'TIME_SERIES_WEEKLY',
            'symbol': symbol
        }
        
        data = self._make_request(params)
        if data:
            self.cache[cache_key] = data
            return data
        return None
    
    def get_monthly(self, symbol):
        """Obtém dados mensais."""
        cache_key = f"monthly_{symbol}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        params = {
            'function': 'TIME_SERIES_MONTHLY',
            'symbol': symbol
        }
        
        data = self._make_request(params)
        if data:
            self.cache[cache_key] = data
            return data
        return None
    
    def get_sma(self, symbol, interval='daily', time_period=20):
        """
        Obtém Simple Moving Average.
        interval: 'daily', 'weekly', 'monthly'
        """
        params = {
            'function': 'SMA',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period,
            'series_type': 'close'
        }
        
        data = self._make_request(params)
        return data
    
    def get_ema(self, symbol, interval='daily', time_period=20):
        """Obtém Exponential Moving Average."""
        params = {
            'function': 'EMA',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period,
            'series_type': 'close'
        }
        
        data = self._make_request(params)
        return data
    
    def get_rsi(self, symbol, interval='daily', time_period=14):
        """Obtém Relative Strength Index."""
        params = {
            'function': 'RSI',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period,
            'series_type': 'close'
        }
        
        data = self._make_request(params)
        return data
    
    def get_macd(self, symbol, interval='daily'):
        """Obtém MACD (Moving Average Convergence Divergence)."""
        params = {
            'function': 'MACD',
            'symbol': symbol,
            'interval': interval,
            'series_type': 'close'
        }
        
        data = self._make_request(params)
        return data
    
    def get_bbands(self, symbol, interval='daily', time_period=20):
        """Obtém Bollinger Bands."""
        params = {
            'function': 'BBANDS',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period,
            'series_type': 'close'
        }
        
        data = self._make_request(params)
        return data
    
    def get_atr(self, symbol, interval='daily', time_period=14):
        """Obtém Average True Range."""
        params = {
            'function': 'ATR',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period
        }
        
        data = self._make_request(params)
        return data
    
    def get_stoch(self, symbol, interval='daily'):
        """Obtém Stochastic Oscillator."""
        params = {
            'function': 'STOCH',
            'symbol': symbol,
            'interval': interval
        }
        
        data = self._make_request(params)
        return data
    
    def get_adx(self, symbol, interval='daily', time_period=14):
        """Obtém Average Directional Index."""
        params = {
            'function': 'ADX',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period
        }
        
        data = self._make_request(params)
        return data
    
    def get_cci(self, symbol, interval='daily', time_period=20):
        """Obtém Commodity Channel Index."""
        params = {
            'function': 'CCI',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period
        }
        
        data = self._make_request(params)
        return data
    
    def get_aroon(self, symbol, interval='daily', time_period=25):
        """Obtém Aroon Indicator."""
        params = {
            'function': 'AROON',
            'symbol': symbol,
            'interval': interval,
            'time_period': time_period
        }
        
        data = self._make_request(params)
        return data
    
    def get_obv(self, symbol, interval='daily'):
        """Obtém On Balance Volume."""
        params = {
            'function': 'OBV',
            'symbol': symbol,
            'interval': interval
        }
        
        data = self._make_request(params)
        return data
    
    def get_ad(self, symbol, interval='daily'):
        """Obtém Chaikin A/D Line."""
        params = {
            'function': 'AD',
            'symbol': symbol,
            'interval': interval
        }
        
        data = self._make_request(params)
        return data
    
    def get_vpt(self, symbol, interval='daily'):
        """Obtém Volume Price Trend."""
        params = {
            'function': 'VPT',
            'symbol': symbol,
            'interval': interval
        }
        
        data = self._make_request(params)
        return data
    
    def parse_daily_data(self, data):
        """
        Converte dados diários da API em DataFrame.
        Retorna: DataFrame com OHLCV
        """
        if not data or 'Time Series (Daily)' not in data:
            return None
        
        time_series = data['Time Series (Daily)']
        df_data = []
        
        for date_str, values in time_series.items():
            df_data.append({
                'Date': pd.to_datetime(date_str),
                'Open': float(values['1. open']),
                'High': float(values['2. high']),
                'Low': float(values['3. low']),
                'Close': float(values['4. close']),
                'Volume': int(values['5. volume'])
            })
        
        df = pd.DataFrame(df_data)
        df = df.sort_values('Date')
        df.set_index('Date', inplace=True)
        return df
    
    def parse_indicator_data(self, data, indicator_name):
        """
        Converte dados de indicador em DataFrame.
        """
        if not data or indicator_name not in data:
            return None
        
        indicator_data = data[indicator_name]
        df_data = []
        
        for date_str, values in indicator_data.items():
            row = {'Date': pd.to_datetime(date_str)}
            row.update({k: float(v) if v != 'None' else None for k, v in values.items()})
            df_data.append(row)
        
        df = pd.DataFrame(df_data)
        df = df.sort_values('Date')
        df.set_index('Date', inplace=True)
        return df
