import numpy as np
from datetime import datetime
from .config import DataConfig
from .holidays import is_holiday

def generate_load(cfg: DataConfig, timestamps, weather):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 2)
    load = np.zeros(n)

    for i, ts in enumerate(timestamps):
        hour = ts.hour + ts.minute / 60
        day_of_week = ts.weekday()
        day_of_year = ts.timetuple().tm_yday
        year_frac = day_of_year / 365.25
        holiday = is_holiday(ts)

        annual = cfg.annual_amp_mw * np.sin(2 * np.pi * (year_frac - 0.3))
        weekly = cfg.weekday_peak_mw if day_of_week < 5 else cfg.weekend_dip_mw
        daily = cfg.daily_amp_mw * (
            0.4 * np.sin(2 * np.pi * (hour - 4) / 24) +
            0.6 * max(0, np.sin(2 * np.pi * (hour - 7) / 12))
        )
        holiday_effect = (1 - cfg.holiday_dip_factor) if holiday else 0
        holiday_factor = 1.0 - holiday_effect

        temp = weather["temperature_c"][i]
        heating_load = max(0, (15 - temp) * 0.8)
        cooling_load = max(0, (temp - 22) * 0.6)

        noise = rng.normal(0, cfg.load_noise_std)
        load[i] = (cfg.base_load_mw + annual + weekly + daily) * holiday_factor + heating_load + cooling_load + noise

    load = np.maximum(load, 5)
    return load
