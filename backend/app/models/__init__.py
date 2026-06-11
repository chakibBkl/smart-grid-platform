from .user import User
from .energy_data import LoadData, SolarData, WindData, MarketData, BatteryData
from .forecast import Forecast
from .market_prediction import MarketPrediction
from .optimization import OptimizationResult
from .conversation import Conversation

all_models = [User, LoadData, SolarData, WindData, MarketData, BatteryData,
              Forecast, MarketPrediction, OptimizationResult, Conversation]

__all__ = ["all_models"] + [m.__name__ for m in all_models]
