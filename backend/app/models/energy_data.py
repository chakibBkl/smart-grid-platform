from sqlalchemy import Column, Integer, Float, DateTime
from ..database import Base

class LoadData(Base):
    __tablename__ = "load_data"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    load_mw = Column(Float)
    industrial_load_mw = Column(Float)
    commercial_load_mw = Column(Float)
    residential_load_mw = Column(Float)
    temperature_c = Column(Float)

class SolarData(Base):
    __tablename__ = "solar_data"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    solar_generation_mw = Column(Float)
    solar_irradiance_wm2 = Column(Float)
    cloud_cover_pct = Column(Float)
    temperature_c = Column(Float)

class WindData(Base):
    __tablename__ = "wind_data"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    wind_generation_mw = Column(Float)
    wind_speed_ms = Column(Float)
    temperature_c = Column(Float)

class MarketData(Base):
    __tablename__ = "market_data"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    price_per_mwh = Column(Float)
    load_mw = Column(Float)
    solar_generation_mw = Column(Float)
    wind_generation_mw = Column(Float)
    net_load_mw = Column(Float)

class BatteryData(Base):
    __tablename__ = "battery_data"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    state_of_charge_mwh = Column(Float)
    soc_percentage = Column(Float)
    load_mw = Column(Float)
    solar_generation_mw = Column(Float)
    wind_generation_mw = Column(Float)
    market_price_per_mwh = Column(Float)
