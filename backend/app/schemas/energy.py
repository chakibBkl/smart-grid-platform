from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LoadDataResponse(BaseModel):
    timestamp: datetime
    load_mw: float
    industrial_load_mw: float
    commercial_load_mw: float
    residential_load_mw: float
    temperature_c: float

    class Config:
        from_attributes = True

class SolarDataResponse(BaseModel):
    timestamp: datetime
    solar_generation_mw: float
    solar_irradiance_wm2: float
    cloud_cover_pct: float
    temperature_c: float

    class Config:
        from_attributes = True

class WindDataResponse(BaseModel):
    timestamp: datetime
    wind_generation_mw: float
    wind_speed_ms: float
    temperature_c: float

    class Config:
        from_attributes = True

class MarketDataResponse(BaseModel):
    timestamp: datetime
    price_per_mwh: float
    load_mw: float
    solar_generation_mw: float
    wind_generation_mw: float
    net_load_mw: float

    class Config:
        from_attributes = True

class BatteryDataResponse(BaseModel):
    timestamp: datetime
    state_of_charge_mwh: float
    soc_percentage: float
    load_mw: float
    solar_generation_mw: float
    wind_generation_mw: float
    market_price_per_mwh: float

    class Config:
        from_attributes = True
