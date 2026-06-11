from sqlalchemy import Column, Integer, Float, DateTime, String, JSON
from sqlalchemy.sql import func
from ..database import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    forecast_type = Column(String(50), nullable=False)
    target_timestamp = Column(DateTime, nullable=False)
    value = Column(Float)
    upper_bound = Column(Float)
    lower_bound = Column(Float)
    confidence = Column(Float)
    model_used = Column(String(100))
    features_used = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
