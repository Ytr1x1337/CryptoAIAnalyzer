import ccxt

class ExchangeService:
    def __init__(self, exchange_name: str):
        if not hasattr(ccxt, exchange_name):
            raise ValueError(f"Exchange '{exchange_name}' not supported")
        
        exchange_class = getattr(ccxt, exchange_name)
        self.exchange = exchange_class()
        self.exchange_name = exchange_name
        
        self.exchange = exchange_class({
            "enableRateLimit": True,
            "options": {"defaultType": "spot"}})

    def get_ticker(self, symbol: str):
        return self.exchange.fetch_ticker(symbol)

    def get_ohlcv(self, symbol: str, timeframe="1h", limit=1):
        return self.exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)

