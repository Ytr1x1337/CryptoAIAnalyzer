from fastapi import APIRouter, HTTPException

from analytics.ai import AIService
from analytics.exchange_manager import ExchangeManager
from analytics.analytics_service import AnalyticsService
from data.collector import ExchangeService


router = APIRouter(prefix="/crypto", tags=["Crypto"])
exchange_manager = ExchangeManager()


@router.get("/exchanges")
async def get_exchanges():
    return exchange_manager.get_exchanges()


@router.get("/markets")
async def get_markets(exchange: str):
    try:
        return exchange_manager.get_markets(exchange)
    except Exception:
        raise HTTPException(status_code=400, detail="Биржа не поддерживается")
    

@router.get("/analyze")
def analyze_market(exchange: str, symbol: str,):
    try:
        exchange_service = ExchangeService(exchange)
        analytics = AnalyticsService()

        ticker = exchange_service.get_ticker(symbol)

        ohlcv_7d = exchange_service.get_ohlcv(
            symbol,
            timeframe="1d",
            limit=7
        )

        ohlcv_24h = exchange_service.get_ohlcv(
            symbol,
            timeframe="1h",
            limit=24
        )

        vol_day = analytics.calculate_volatility(ohlcv_24h)
        vol_week = analytics.calculate_volatility(ohlcv_7d)

        ohlcv_30d = exchange_service.get_ohlcv(
            symbol,
            timeframe="1d",
            limit=30
        )

        ohlcv_30d_1h = exchange_service.get_ohlcv(
            symbol,
            timeframe="1h",
            limit=720
        )
        
        vol_month = analytics.calculate_volatility(ohlcv_30d)
        chart_vol = analytics.calculate_chart_vol(ohlcv_30d_1h)
        max_drawdown = analytics.calculate_max_drawdown(ohlcv_30d)
        price = ticker.get("last") or ticker.get("close")

        analysis_text = AIService.generate_analysis({
            "price": price,
            "volatility_day": vol_day,
            "volatility_week": vol_week,
            "volatility_month": vol_month,
            "max_drawdown": max_drawdown
        })



        return {
            "price": ticker["last"],
            "max_drawdown": max_drawdown,
            "volatility_day": vol_day,
            "volatility_week": vol_week,
            "volatility_month": vol_month,
            "chart_prices": [c[4] for c in ohlcv_30d],
            "chart_volatility": chart_vol,
            "analysis_text": analysis_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

