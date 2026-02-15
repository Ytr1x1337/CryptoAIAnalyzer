import ccxt
import time
from threading import Lock
from typing import Dict, List


class ExchangeManager:
    def __init__(self, cache_ttl: int = 300):

        self.exchanges: Dict[str, ccxt.Exchange] = {}
        self.markets_cache: Dict[str, dict] = {}
        self.cache_timestamp: Dict[str, float] = {}
        self.cache_ttl = cache_ttl
        self.lock = Lock()

        self.supported = [
            "binance",
            "bybit",
            "okx",
            "coinbase",
            "kucoin",
            "bitget",
            "mexc"
        ]

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

            except Exception as e:
                raise RuntimeError(
                    f"Failed to initialize exchange '{exchange_id}'"
                ) from e

    
    def get_exchanges(self) -> List[str]:
        return list(self.exchanges.keys())


    def _load_markets(self, exchange_name: str):
        if exchange_name not in self.exchanges:
            raise ValueError(f"Exchange '{exchange_name}' not supported")

        exchange = self.exchanges[exchange_name]

        try:
            markets = exchange.load_markets()
            return markets
        except Exception as e:
            raise RuntimeError(f"Failed to load markets for {exchange_name}: {e}")


    def get_markets(self, exchange_name: str, force_refresh: bool = False) -> List[str]:

        if exchange_name not in self.exchanges:
            raise ValueError(f"Exchange '{exchange_name}' not initialized")

        with self.lock:
            now = time.time()

            if (
                not force_refresh
                and exchange_name in self.markets_cache
                and now - self.cache_timestamp.get(exchange_name, 0) < self.cache_ttl
            ):
                markets = self.markets_cache[exchange_name]
            else:
                markets = self._load_markets(exchange_name)
                self.markets_cache[exchange_name] = markets
                self.cache_timestamp[exchange_name] = now

        usdt_pairs = [
            market["symbol"]
            for market in markets.values()
            if market.get("quote") == "USDT"
            and market.get("active", False)
            and ":" not in market.get("symbol", "")
            and market.get("spot", True) 
        ]

        return sorted(usdt_pairs)





