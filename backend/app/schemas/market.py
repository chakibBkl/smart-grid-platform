from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MarketPredictionRequest(BaseModel):
    horizon_hours: int = 24
    include_confidence: bool = True

class MarketPredictionResponse(BaseModel):
    timestamps: list[datetime]
    predicted_prices: list[float]
    confidence_low: list[float]
    confidence_high: list[float]
    market_sentiment: str
    driving_factors: dict
