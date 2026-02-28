import numpy as np


class AnalyticsService:

    @staticmethod
    def calculate_volatility(ohlcv: list) -> float:
        if not ohlcv or not isinstance(ohlcv[0], (list, tuple)):
            raise ValueError("Invalid OHLCV format")

        closes = np.array([candle[4] for candle in ohlcv])

        if len(closes) < 2:
            return 0.0

        returns = np.diff(np.log(closes))

        volatility = np.std(returns)

        return float(volatility)*100


    @staticmethod
    def calculate_chart_vol(ohlcv: list) -> list:
        if not ohlcv or len(ohlcv) < 270:
            return []

        ohlcv = sorted(ohlcv, key=lambda x: x[0])

        ohlcv = ohlcv[-720:]

        a = AnalyticsService()
        chart_vol = []

        for i in range(0, len(ohlcv), 24):
            day_slice = ohlcv[i:i+24]

            if len(day_slice) < 2:
                continue

            vol_day = a.calculate_volatility(day_slice)
            chart_vol.append(vol_day)

        return chart_vol




    @staticmethod
    def calculate_max_drawdown(ohlcv: list) -> float:
        if not ohlcv or len(ohlcv) < 2:
            return 0.0
        
        closes = [candle[4] for candle in ohlcv]

        peak = closes[0]
        max_drawdown = 0

        for price in closes:
            if price > peak:
                peak = price

            drawdown = (price - peak) / peak

            if drawdown < max_drawdown:
                max_drawdown = drawdown

        return float(max_drawdown)*100

