from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone
from typing import Optional
import pandas as pd
import os

from ..database import get_db
from ..models.energy_data import LoadData, SolarData, WindData, MarketData, BatteryData
from ..core.security import get_current_user
from ..models.user import User
from ..config import settings

router = APIRouter(prefix="/energy", tags=["Energy Data"])

CSV_MAP = {
    "load": ("load_data.csv", LoadData),
    "solar": ("solar_data.csv", SolarData),
    "wind": ("wind_data.csv", WindData),
    "market": ("market_data.csv", MarketData),
    "battery": ("battery_data.csv", BatteryData),
}

async def load_csv_to_db(data_type: str, db: AsyncSession):
    filename, model = CSV_MAP[data_type]
    csv_path = os.path.join(settings.DATA_DIR, filename)
    if not os.path.exists(csv_path):
        return False

    result = await db.execute(select(func.count(model.id)))
    count = result.scalar()
    if count > 0:
        return True

    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        obj = model(**{k: v for k, v in row.items() if hasattr(model, k)})
        db.add(obj)
    await db.commit()
    return True

@router.get("/{data_type}")
async def get_energy_data(
    data_type: str,
    hours: int = Query(24, le=8760),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data_type not in CSV_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid data type: {data_type}")

    _, model = CSV_MAP[data_type]

    if start and end:
        query = select(model).where(
            model.timestamp >= start,
            model.timestamp <= end,
        ).order_by(model.timestamp)
    else:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        query = select(model).where(model.timestamp >= cutoff).order_by(model.timestamp)

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{data_type}/summary")
async def get_energy_summary(
    data_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data_type not in CSV_MAP:
        raise HTTPException(status_code=400, detail=f"Invalid data type")

    _, model = CSV_MAP[data_type]
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(select(model).where(model.timestamp >= cutoff))
    records = result.scalars().all()

    if not records:
        return {"message": "No data available"}

    values = [r for r in records]
    numeric_cols = [c.name for c in model.__table__.columns if c.name not in ("id", "timestamp")]
    summary = {}
    for col in numeric_cols:
        vals = [getattr(r, col) for r in values if getattr(r, col) is not None]
        if vals:
            summary[col] = {
                "min": round(min(vals), 2),
                "max": round(max(vals), 2),
                "avg": round(sum(vals) / len(vals), 2),
                "current": round(vals[-1], 2),
            }
    return summary
