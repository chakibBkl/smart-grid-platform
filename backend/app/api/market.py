from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from typing import Optional
import numpy as np

from ..database import get_db
from ..schemas.market import MarketPredictionRequest, MarketPredictionResponse
from ..models.market_prediction import MarketPrediction
from ..core.security import get_current_user
from ..models.user import User

router = APIRouter(prefix="/market", tags=["Market Prediction"])

@router.post("/predict", response_model=MarketPredictionResponse)
async def predict_market(
    request: MarketPredictionRequest,
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    n_points = request.horizon_hours * 4

    timestamps = [now + timedelta(minutes=15 * i) for i in range(n_points)]
    predicted_prices = []
    confidence_low = []
    confidence_high = []

    for i in range(n_points):
        h = i / 4
        hour_of_day = (now.hour + h) % 24
        is_weekend = now.weekday() >= 5

        base = 45
        peak = 20 * (1 if 7 <= hour_of_day <= 22 else 0.3)
        weekend_dip = -8 if is_weekend else 0
        daily_cycle = 10 * np.sin(2 * np.pi * (hour_of_day - 8) / 24)
        noise = np.random.normal(0, 5)

        price = base + peak + weekend_dip + daily_cycle + noise
        predicted_prices.append(round(price, 2))
        confidence_low.append(round(price - 1.96 * 5, 2))
        confidence_high.append(round(price + 1.96 * 5, 2))

    avg_price = np.mean(predicted_prices)
    sentiment = "bullish" if avg_price > 55 else "bearish" if avg_price < 35 else "neutral"

    driving_factors = {
        "renewable_penetration": round(np.random.uniform(15, 40), 1),
        "demand_forecast": f"{round(np.random.uniform(45, 65), 1)} MW",
        "fuel_prices": f"${round(np.random.uniform(2.5, 4.5), 2)}/MMBtu",
        "weather_impact": sentiment,
        "grid_congestion": "low" if np.random.random() > 0.7 else "moderate",
    }

    return MarketPredictionResponse(
        timestamps=timestamps,
        predicted_prices=predicted_prices,
        confidence_low=confidence_low,
        confidence_high=confidence_high,
        market_sentiment=sentiment,
        driving_factors=driving_factors,
    )

@router.get("/prices")
async def get_historical_prices(
    hours: int = Query(24, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    result = await db.execute(
        select(MarketPrediction).where(MarketPrediction.created_at >= cutoff)
    )
    return result.scalars().all()

@router.get("/sentiment")
async def get_market_sentiment():
    avg_price = 45 + np.random.normal(0, 10)
    sentiment = "bullish" if avg_price > 55 else "bearish" if avg_price < 35 else "neutral"
    return {
        "current_sentiment": sentiment,
        "average_price": round(avg_price, 2),
        "volatility": round(np.random.uniform(5, 25), 2),
        "trading_volume_mwh": round(np.random.uniform(1000, 5000), 0),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
