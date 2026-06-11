from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class OptimizationRequest(BaseModel):
    optimization_type: str = "cost"
    horizon_hours: int = 24
    initial_battery_soc: float = 25.0
    risk_tolerance: str = "medium"

class OptimizationResponse(BaseModel):
    recommended_actions: list[dict]
    expected_savings: float
    battery_schedule: list[dict]
    trading_schedule: list[dict]
    risk_score: float
