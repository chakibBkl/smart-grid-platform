import numpy as np
from .config import DataConfig

def wind_power_curve(wind_speed):
    v_in, v_rated, v_out = 3.5, 12, 25
    if wind_speed < v_in or wind_speed > v_out:
        return 0
    if wind_speed >= v_rated:
        return 1.0
    return (wind_speed - v_in) ** 3 / (v_rated - v_in) ** 3

def generate_wind(cfg: DataConfig, timestamps, weather):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 4)
    wind = np.zeros(n)

    for i in range(n):
        ws = weather["wind_speed_ms"][i]
        turb = 1 + rng.normal(0, 0.08)
        power_factor = wind_power_curve(ws * turb)
        wind[i] = cfg.wind_capacity_mw * power_factor

    gusts = np.abs(rng.normal(0, 3, n))
    ramp_events = rng.random(n) < 0.005
    wind = np.where(ramp_events, wind * (1 + gusts * 0.1), wind)
    wind = np.clip(wind, 0, cfg.wind_capacity_mw)
    return wind
