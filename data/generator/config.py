from dataclasses import dataclass
from datetime import datetime, timedelta
import numpy as np

@dataclass
class DataConfig:
    start_date: datetime = datetime(2021, 1, 1, 0, 0)
    years: int = 5
    resolution_minutes: int = 15
    random_seed: int = 42

    @property
    def n_timesteps(self) -> int:
        return int(self.years * 365.25 * 24 * 60 / self.resolution_minutes)

    @property
    def end_date(self) -> datetime:
        return self.start_date + timedelta(days=int(self.years * 365.25))

    @property
    def timestamps(self):
        return [self.start_date + timedelta(minutes=i * self.resolution_minutes)
                for i in range(self.n_timesteps)]

    # Industrial load params
    base_load_mw: float = 50.0
    weekday_peak_mw: float = 20.0
    weekend_dip_mw: float = -15.0
    daily_amp_mw: float = 15.0
    annual_amp_mw: float = 10.0
    load_noise_std: float = 3.0
    holiday_dip_factor: float = 0.6

    # Solar params
    solar_capacity_mw: float = 100.0
    summer_peak_factor: float = 1.3
    winter_peak_factor: float = 0.4
    cloud_cover_std: float = 0.2
    clear_sky_factor: float = 0.9

    # Wind params
    wind_capacity_mw: float = 80.0
    wind_base_speed: float = 7.0
    wind_seasonal_amp: float = 2.0
    wind_noise_std: float = 1.5

    # Market params
    base_price_per_mwh: float = 45.0
    peak_price_premium: float = 30.0
    price_noise_std: float = 8.0

    # Battery params
    battery_capacity_mwh: float = 50.0
    charge_efficiency: float = 0.92
    discharge_efficiency: float = 0.92
    max_charge_rate_mw: float = 25.0
    max_discharge_rate_mw: float = 25.0

    # Anomaly params
    anomaly_fraction: float = 0.01
    heatwave_temp_threshold: float = 35.0

    # Weather base generation
    lat: float = 40.7128
    lon: float = -74.0060
