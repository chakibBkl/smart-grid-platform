import os
import pandas as pd
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import csv
from typing import Optional

from ..config import settings
from ..models.energy_data import LoadData, SolarData, WindData, MarketData, BatteryData

MODEL_MAP = {
    "load": (LoadData, "load_data.csv"),
    "solar": (SolarData, "solar_data.csv"),
    "wind": (WindData, "wind_data.csv"),
    "market": (MarketData, "market_data.csv"),
    "battery": (BatteryData, "battery_data.csv"),
}

async def ensure_data_loaded(db: AsyncSession, data_type: Optional[str] = None):
    types = [data_type] if data_type else list(MODEL_MAP.keys())

    for dt in types:
        model, filename = MODEL_MAP[dt]
        csv_path = os.path.join(settings.DATA_DIR, filename)
        if not os.path.exists(csv_path):
            continue

        result = await db.execute(select(func.count(model.id)))
        if result.scalar() > 0:
            continue

        print(f"Loading {filename} into database...")
        chunk_size = 10000
        for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
            for _, row in chunk.iterrows():
                row_dict = row.to_dict()
                row_dict["timestamp"] = datetime.strptime(row_dict["timestamp"], "%Y-%m-%d %H:%M:%S")
                obj = model(**row_dict)
                db.add(obj)
            await db.commit()
        print(f"Loaded {filename}")
