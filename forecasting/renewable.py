import os
import numpy as np
import pandas as pd
import pickle
from typing import Optional, Tuple, Dict, Any, List
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
SOLAR_MODEL_PATH = os.path.join(MODEL_DIR, "solar_forecast.pkl")
WIND_MODEL_PATH = os.path.join(MODEL_DIR, "wind_forecast.pkl")


class RenewableForecaster:
    """Hybrid forecasting model for solar and wind power using Random Forest."""

    def __init__(self):
        self.solar_model: Optional[RandomForestRegressor] = None
        self.wind_model: Optional[RandomForestRegressor] = None

    def _build_model(self) -> RandomForestRegressor:
        return RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_leaf=3,
            random_state=42,
            n_jobs=-1,
        )

    def prepare_data(
        self,
        df: pd.DataFrame,
    ) -> Tuple[Dict[str, np.ndarray], Dict[str, np.ndarray]]:
        feature_cols = ["temperature", "irradiance", "wind_speed", "humidity",
                        "hour", "day_of_week", "month"]
        feature_cols = [c for c in feature_cols if c in df.columns]

        X = df[feature_cols].values.astype(np.float32)

        targets: Dict[str, np.ndarray] = {}
        data: Dict[str, np.ndarray] = {}
        for target in ["solar_generation_kw", "wind_generation_kw"]:
            if target in df.columns:
                y = df[target].values.astype(np.float32)
                mask = ~np.isnan(y)
                data[target] = {"X": X[mask], "y": y[mask]}

        return data, {"features": feature_cols}

    def train(
        self,
        df: pd.DataFrame,
        test_size: float = 0.2,
    ) -> Dict[str, Any]:
        data, meta = self.prepare_data(df)
        results = {}

        for target in ["solar_generation_kw", "wind_generation_kw"]:
            if target not in data:
                continue
            X, y = data[target]["X"], data[target]["y"]
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

            model = self._build_model()
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            results[target] = {
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
                "r2": float(r2_score(y_test, y_pred)),
                "test_samples": int(len(y_test)),
            }

            if "solar" in target:
                self.solar_model = model
            else:
                self.wind_model = model

        self.save()
        return results

    def predict_hourly(
        self, weather_features: np.ndarray
    ) -> Dict[str, List[float]]:
        """Predict next 3 hours of solar and wind power.
        Args:
            weather_features: shape (3, n_features) or (n_features,) — weather for each hour
        """
        if weather_features.ndim == 1:
            weather_features = weather_features.reshape(1, -1)

        solar_pred = []
        wind_pred = []

        for row in weather_features:
            x = row.reshape(1, -1)
            if self.solar_model is not None:
                solar_pred.append(float(self.solar_model.predict(x)[0]))
            if self.wind_model is not None:
                wind_pred.append(float(self.wind_model.predict(x)[0]))

        return {
            "solar_kw": solar_pred,
            "wind_kw": wind_pred,
        }

    def save(self) -> Dict[str, str]:
        os.makedirs(MODEL_DIR, exist_ok=True)
        paths = {}
        if self.solar_model is not None:
            with open(SOLAR_MODEL_PATH, "wb") as f:
                pickle.dump(self.solar_model, f)
            paths["solar"] = SOLAR_MODEL_PATH
        if self.wind_model is not None:
            with open(WIND_MODEL_PATH, "wb") as f:
                pickle.dump(self.wind_model, f)
            paths["wind"] = WIND_MODEL_PATH
        return paths

    def load(self) -> bool:
        loaded = False
        if os.path.exists(SOLAR_MODEL_PATH):
            with open(SOLAR_MODEL_PATH, "rb") as f:
                self.solar_model = pickle.load(f)
            loaded = True
        if os.path.exists(WIND_MODEL_PATH):
            with open(WIND_MODEL_PATH, "rb") as f:
                self.wind_model = pickle.load(f)
            loaded = True
        return loaded
