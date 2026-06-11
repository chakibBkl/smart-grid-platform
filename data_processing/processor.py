import pandas as pd
import numpy as np
from typing import List, Optional, Dict, Any
from sklearn.preprocessing import MinMaxScaler


class DataProcessor:
    """Data processing pipeline: cleaning, normalization, feature extraction, anomaly detection."""

    def __init__(self, numeric_columns: Optional[List[str]] = None):
        self.numeric_columns = numeric_columns or [
            "demand_kw", "solar_generation_kw", "wind_generation_kw",
            "frequency_hz", "voltage_v", "temperature", "irradiance",
            "wind_speed", "humidity", "state_of_charge",
        ]
        self.scaler = MinMaxScaler()
        self._fitted = False

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        numeric_cols = [c for c in self.numeric_columns if c in df.columns]
        df[numeric_cols] = df[numeric_cols].interpolate(method="linear", limit_direction="both")
        df[numeric_cols] = df[numeric_cols].bfill().ffill()
        return df

    def normalize(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        df = df.copy()
        numeric_cols = [c for c in self.numeric_columns if c in df.columns]
        if fit or not self._fitted:
            df[numeric_cols] = self.scaler.fit_transform(df[numeric_cols])
            self._fitted = True
        else:
            df[numeric_cols] = self.scaler.transform(df[numeric_cols])
        return df

    def extract_time_features(self, df: pd.DataFrame, timestamp_col: str = "timestamp") -> pd.DataFrame:
        df = df.copy()
        ts = pd.to_datetime(df[timestamp_col])
        df["hour"] = ts.dt.hour + ts.dt.minute / 60.0
        df["day_of_week"] = ts.dt.dayofweek
        df["month"] = ts.dt.month
        df["is_weekend"] = (ts.dt.dayofweek >= 5).astype(int)
        df["is_peak_hour"] = ((ts.dt.hour >= 8) & (ts.dt.hour <= 20)).astype(int)
        return df

    def detect_anomalies(
        self,
        df: pd.DataFrame,
        column: str = "demand_kw",
        window: int = 12,
        threshold: float = 3.0,
    ) -> pd.DataFrame:
        df = df.copy()
        if column not in df.columns:
            return df
        rolling_mean = df[column].rolling(window=window, center=True).mean()
        rolling_std = df[column].rolling(window=window, center=True).std()
        z_score = (df[column] - rolling_mean) / rolling_std.replace(0, np.nan)
        df[f"{column}_anomaly"] = z_score.abs() > threshold
        df[f"{column}_z_score"] = z_score
        return df

    def process_pipeline(
        self,
        df: pd.DataFrame,
        timestamp_col: str = "timestamp",
        anomaly_column: str = "demand_kw",
        fit_scaler: bool = True,
    ) -> pd.DataFrame:
        df = self.clean(df)
        df = self.extract_time_features(df, timestamp_col)
        df = self.normalize(df, fit=fit_scaler)
        df = self.detect_anomalies(df, column=anomaly_column)
        return df

    def get_anomaly_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        anomaly_cols = [c for c in df.columns if c.endswith("_anomaly")]
        summary = {}
        for col in anomaly_cols:
            feature = col.replace("_anomaly", "")
            count = int(df[col].sum())
            pct = float(df[col].mean() * 100)
            summary[feature] = {"anomaly_count": count, "anomaly_pct": round(pct, 2)}
        return summary
