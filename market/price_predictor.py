import os
import numpy as np
import pandas as pd
import pickle
from typing import Optional, List, Dict, Any
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
XGB_MODEL_PATH = os.path.join(MODEL_DIR, "price_predictor_xgb.pkl")


class MarketPricePredictor:
    """XGBoost model for day-ahead electricity price prediction.

    Features: historical prices (7 days), forecasted load, forecasted renewable
    generation, day of week, holiday flag.
    Output: next 24 hours of prices (hourly).
    """

    def __init__(self):
        self.model: Optional[XGBRegressor] = None
        self._feature_cols: List[str] = []

    def _build_model(self) -> XGBRegressor:
        return XGBRegressor(
            n_estimators=300,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
        )

    def prepare_data(
        self,
        df: pd.DataFrame,
        price_col: str = "price_per_mwh",
        horizon: int = 24,
    ) -> Dict[str, Any]:
        feature_cols = [
            f"lag_price_{h}" for h in range(1, 169)
        ] + ["forecasted_load", "forecasted_renewable", "day_of_week", "is_holiday"]

        available_features = [c for c in feature_cols if c in df.columns]
        self._feature_cols = available_features

        X, y = [], []
        for i in range(len(df) - horizon):
            row = df.iloc[i]
            features = row[available_features].values.astype(np.float32)
            X.append(features)
            y.append(df.iloc[i + 1 : i + horizon + 1][price_col].values.astype(np.float32))

        return {"X": np.array(X), "y": np.array(y)}

    def train(
        self,
        df: pd.DataFrame,
        test_size: float = 0.2,
    ) -> Dict[str, Any]:
        data = self.prepare_data(df)
        X, y = data["X"], data["y"]

        n = len(X)
        split = int(n * (1 - test_size))
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        y_train_flat = y_train.reshape(-1)
        y_test_flat = y_test.reshape(-1)
        X_train_rep = np.repeat(X_train, y_train.shape[1], axis=0)
        X_test_rep = np.repeat(X_test, y_test.shape[1], axis=0)

        self.model = self._build_model()
        self.model.fit(
            X_train_rep, y_train_flat,
            eval_set=[(X_test_rep, y_test_flat)],
            verbose=False,
        )

        y_pred_flat = self.model.predict(X_test_rep)
        y_pred = y_pred_flat.reshape(y_test.shape)

        results = {
            "mae": float(mean_absolute_error(y_test_flat, y_pred_flat)),
            "rmse": float(np.sqrt(mean_squared_error(y_test_flat, y_pred_flat))),
            "r2": float(r2_score(y_test_flat, y_pred_flat)),
        }

        self.save()
        return results

    def predict(self, features: np.ndarray) -> np.ndarray:
        """Predict next 24 hours of prices.
        Args:
            features: shape (n_features,) or (1, n_features)
        Returns:
            shape (24,) — hourly prices
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() or train() first.")
        if features.ndim == 1:
            features = features.reshape(1, -1)
        return self.model.predict(features)

    def save(self, path: str = XGB_MODEL_PATH) -> str:
        if self.model is None:
            raise RuntimeError("No model to save.")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump(self.model, f)
        return path

    def load(self, path: str = XGB_MODEL_PATH) -> bool:
        if not os.path.exists(path):
            return False
        with open(path, "rb") as f:
            self.model = pickle.load(f)
        return True
