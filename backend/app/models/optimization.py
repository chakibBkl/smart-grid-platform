from sqlalchemy import Column, Integer, Float, DateTime, String, JSON
from sqlalchemy.sql import func
from ..database import Base

class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    optimization_type = Column(String(50), nullable=False)
    target_timestamp = Column(DateTime, nullable=False)
    recommended_action = Column(String(100))
    expected_savings = Column(Float)
    battery_schedule = Column(JSON)
    trading_schedule = Column(JSON)
    risk_score = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
