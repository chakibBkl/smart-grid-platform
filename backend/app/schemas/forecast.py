from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ForecastRequest(BaseModel):
    model_config = {"protected_namespaces": ()}
    forecast_type: str
    horizon_hours: int = 48
    include_weather: bool = True

class ForecastResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    timestamps: list[datetime]
    values: list[float]
    upper_bounds: list[float]
    lower_bounds: list[float]
    confidence: float
    model_used: str
