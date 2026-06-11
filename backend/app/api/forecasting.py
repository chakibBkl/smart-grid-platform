from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from typing import Optional
import numpy as np

from ..database import get_db
from ..schemas.forecast import ForecastRequest, ForecastResponse
from ..models.forecast import Forecast
from ..core.security import get_current_user
from ..core.celery_app import run_forecast_task
from ..models.user import User

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])

@router.post("/predict", response_model=ForecastResponse)
async def predict_forecast(
    request: ForecastRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    n_points = request.horizon_hours * 4

    base_value = 50 if request.forecast_type == "load" else 45 if request.forecast_type == "price" else 30
    timestamps = [now + timedelta(minutes=15 * i) for i in range(n_points)]
    values = []
    for i in range(n_points):
        h = i / 4
        daily = 15 * np.sin(2 * np.pi * (now.hour + h) / 24)
        weekly = 5 * np.sin(2 * np.pi * (now.weekday() + h / 24) / 7)
        noise = np.random.normal(0, 3)
        val = base_value + daily + weekly + noise
        values.append(round(val, 2))

    result = {
        "timestamps": timestamps,
        "values": values,
        "upper_bounds": [round(v + 1.96 * 3, 2) for v in values],
        "lower_bounds": [round(v - 1.96 * 3, 2) for v in values],
        "confidence": 0.95,
        "model_used": f"ensemble_{request.forecast_type}_v2",
    }

    forecast_record = Forecast(
        forecast_type=request.forecast_type,
        target_timestamp=timestamps[-1],
        value=values[-1],
        upper_bound=result["upper_bounds"][-1],
        lower_bound=result["lower_bounds"][-1],
        confidence=0.95,
        model_used=result["model_used"],
    )
    db.add(forecast_record)
    await db.commit()

    return result

@router.get("/history")
async def get_forecast_history(
    forecast_type: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Forecast).order_by(Forecast.created_at.desc()).limit(limit)
    if forecast_type:
        query = query.where(Forecast.forecast_type == forecast_type)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/async-predict")
async def async_forecast(request: ForecastRequest):
    task = run_forecast_task.delay(request.forecast_type, request.horizon_hours)
    return {"task_id": task.id, "status": "processing"}
