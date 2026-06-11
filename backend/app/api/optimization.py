from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta, timezone
import numpy as np

from ..schemas.optimization import OptimizationRequest, OptimizationResponse
from ..core.security import get_current_user
from ..core.celery_app import run_optimization_task
from ..models.user import User

router = APIRouter(prefix="/optimization", tags=["Optimization"])

@router.post("/optimize", response_model=OptimizationResponse)
async def optimize(
    request: OptimizationRequest,
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    schedule = []
    soc = request.initial_battery_soc

    risk_factors = {"low": 0.2, "medium": 0.4, "high": 0.7}
    risk_factor = risk_factors.get(request.risk_tolerance, 0.4)

    for h in range(request.horizon_hours):
        hour = (now.hour + h) % 24
        price = 45 + 20 * np.sin(2 * np.pi * (hour - 8) / 24) + np.random.normal(0, 5)
        is_peak = 7 <= hour <= 22

        if price < 35 and soc < 90:
            action = "charge"
            soc_delta = min(10, 90 - soc) * (1 - risk_factor * 0.3)
        elif price > 55 and soc > 20 and is_peak:
            action = "discharge"
            soc_delta = -min(10, soc - 20) * (1 - risk_factor * 0.2)
        else:
            action = "idle"
            soc_delta = -0.5

        soc = max(0, min(100, soc + soc_delta))
        schedule.append({
            "hour": h,
            "timestamp": (now + timedelta(hours=h)).isoformat(),
            "action": action,
            "expected_price": round(price, 2),
            "soc_after": round(soc, 1),
        })

    savings = sum(
        s["expected_price"] * 0.5
        for s in schedule
        if s["action"] == "discharge"
    ) - sum(
        s["expected_price"] * 0.5 * 0.92
        for s in schedule
        if s["action"] == "charge"
    )

    return OptimizationResponse(
        recommended_actions=[s for s in schedule if s["action"] != "idle"][:6],
        expected_savings=round(savings, 2),
        battery_schedule=schedule,
        trading_schedule=[s for s in schedule if s["action"] != "idle"],
        risk_score=round(risk_factor, 2),
    )

@router.post("/async-optimize")
async def async_optimize(request: OptimizationRequest):
    task = run_optimization_task.delay(
        request.optimization_type,
        request.horizon_hours,
        request.initial_battery_soc,
    )
    return {"task_id": task.id, "status": "processing"}
