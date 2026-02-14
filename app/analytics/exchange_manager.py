import ccxt
from threading import Lock

class ExchangeManager:
    def __init__(self):
        self.exchanges = {}
        self.markets_cache = {}
        self.lock = Lock()

        self.supported = [
    "binance",
    "bybit",
    "okx",
    "coinbase",
    "kucoin",
    "bitget",
    "mexc"]

        self._initialize_exchanges()

    def _initialize_exchanges(self):
        for exchange_id in self.supported:
            try:
                exchange_class = getattr(ccxt, exchange_id)
                exchange = exchange_class({
                    "enableRateLimit": True,
                    "timeout": 10000,
                })
                self.exchanges[exchange_id] = exchange
            except Exception:
                continue

    def get_exchanges(self):
        return list(self.exchanges.keys())

    def get_markets(self, exchange_name: str):
        exchange_class = getattr(ccxt, exchange_name)

        exchange = exchange_class({
            "enableRateLimit": True,
            "options": {"defaultType": "spot"}
        })

        markets = exchange.load_markets()

        usdt_pairs = [
            market["symbol"]
            for market in markets.values()
            if market["quote"] == "USDT"
            and market["active"]
            and ":" not in market["symbol"]
        ]

        return sorted(usdt_pairs)


