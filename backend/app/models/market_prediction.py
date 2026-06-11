from sqlalchemy import Column, Integer, Float, DateTime, String, JSON
from sqlalchemy.sql import func
from ..database import Base

class MarketPrediction(Base):
    __tablename__ = "market_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_type = Column(String(50), nullable=False)
    target_timestamp = Column(DateTime, nullable=False)
    predicted_price = Column(Float)
    confidence_interval_low = Column(Float)
    confidence_interval_high = Column(Float)
    market_sentiment = Column(String(20))
    driving_factors = Column(JSON)
    model_version = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
