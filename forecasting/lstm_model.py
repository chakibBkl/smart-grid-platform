import os
import numpy as np
import pandas as pd
from typing import Tuple, Optional, List
from tensorflow.keras.models import Sequential, load_model as keras_load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.optimizers import Adam


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "load_forecast_lstm.keras")


class LoadForecaster:
    """LSTM-based load forecasting model.
    Input: last 24 hours of historical load + weather features (hourly).
    Output: next 6 hours of load (15-min intervals = 24 steps).
    """

    def __init__(
        self,
        input_hours: int = 24,
        output_steps: int = 24,
        learning_rate: float = 0.001,
    ):
        self.input_hours = input_hours
        self.output_steps = output_steps
        self.learning_rate = learning_rate
        self.model: Optional[Sequential] = None
        self._feature_cols: List[str] = []

    def _build_model(self, n_features: int) -> Sequential:
        model = Sequential([
            Input(shape=(self.input_hours, n_features)),
            LSTM(128, return_sequences=True),
            Dropout(0.2),
            LSTM(64, return_sequences=False),
            Dropout(0.2),
            Dense(32, activation="relu"),
            Dense(self.output_steps),
        ])
        model.compile(optimizer=Adam(learning_rate=self.learning_rate), loss="mse", metrics=["mae"])
        self.model = model
        return model

    def prepare_data(
        self,
        df: pd.DataFrame,
        load_col: str = "demand_kw",
        weather_cols: Optional[List[str]] = None,
    ) -> Tuple[np.ndarray, np.ndarray]:
        if weather_cols is None:
            weather_cols = ["temperature", "irradiance", "wind_speed", "humidity"]
        feature_cols = [load_col] + weather_cols
        self._feature_cols = [c for c in feature_cols if c in df.columns]

        ts = df[self._feature_cols].values
        X, y = [], []
        for i in range(len(ts) - self.input_hours - self.output_steps + 1):
            X.append(ts[i : i + self.input_hours])
            y.append(ts[i + self.input_hours : i + self.input_hours + self.output_steps, 0])
        return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        validation_split: float = 0.2,
        epochs: int = 100,
        batch_size: int = 32,
        patience: int = 10,
    ) -> dict:
        if self.model is None:
            self._build_model(n_features=X.shape[2])
        os.makedirs(MODEL_DIR, exist_ok=True)
        callbacks = [
            EarlyStopping(monitor="val_loss", patience=patience, restore_best_weights=True),
            ModelCheckpoint(LSTM_MODEL_PATH, monitor="val_loss", save_best_only=True, save_format="keras"),
        ]
        history = self.model.fit(
            X, y,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1,
        )
        self.save()
        return {
            "final_train_loss": float(history.history["loss"][-1]),
            "final_val_loss": float(history.history["val_loss"][-1]),
            "best_val_loss": float(min(history.history["val_loss"])),
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("Model not loaded or trained. Call load() or train() first.")
        return self.model.predict(X, verbose=0)

    def predict_next(self, recent_data: np.ndarray) -> np.ndarray:
        """Predict next output_steps from a single input window.
        Args:
            recent_data: shape (input_hours, n_features)
        Returns:
            shape (output_steps,) — forecasted load values
        """
        X = recent_data[np.newaxis, ...]
        return self.predict(X)[0]

    def save(self, path: str = LSTM_MODEL_PATH) -> str:
        if self.model is None:
            raise RuntimeError("No model to save.")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.model.save(path)
        return path

    def load(self, path: str = LSTM_MODEL_PATH) -> bool:
        if not os.path.exists(path):
            return False
        self.model = keras_load_model(path)
        return True
