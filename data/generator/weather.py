import numpy as np
from datetime import datetime, timedelta
from .config import DataConfig

def generate_weather(cfg: DataConfig, timestamps):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 1)

    temp = np.zeros(n)
    humidity = np.zeros(n)
    cloud_cover = np.zeros(n)
    wind_speed = np.zeros(n)
    solar_irradiance = np.zeros(n)

    for i, ts in enumerate(timestamps):
        hour = ts.hour + ts.minute / 60
        day_of_year = ts.timetuple().tm_yday
        year_frac = day_of_year / 365.25

        season_factor = np.sin(2 * np.pi * (year_frac - 0.2))
        daily_cycle = np.sin(2 * np.pi * (hour - 6) / 24)

        base_temp = 15 + 15 * season_factor
        daily_temp_var = 8 * daily_cycle
        noise = rng.normal(0, 2)
        temp[i] = base_temp + daily_temp_var + noise

        base_humidity = 60 + 15 * np.cos(2 * np.pi * (year_frac - 0.3))
        hum_noise = rng.normal(0, 8)
        humidity[i] = np.clip(base_humidity + hum_noise, 20, 100)

        if daily_cycle > 0:
            cloud_base = 0.3 + 0.2 * np.sin(2 * np.pi * year_frac)
        else:
            cloud_base = 0.5
        cloud_cover[i] = np.clip(cloud_base + rng.normal(0, cfg.cloud_cover_std), 0, 1)

        wind_seasonal = cfg.wind_base_speed + cfg.wind_seasonal_amp * np.sin(2 * np.pi * (year_frac + 0.1))
        wind_daily = 2 * np.sin(2 * np.pi * (hour - 10) / 24)
        wind_speed[i] = max(0, wind_seasonal + wind_daily + rng.normal(0, cfg.wind_noise_std))

        if daily_cycle > 0:
            hour_angle = (hour - 12) * 15 * np.pi / 180
            solar_elevation = np.sin(np.radians(60)) * np.cos(hour_angle)
            solar_elevation = max(0, solar_elevation)
            clear_sky = cfg.clear_sky_factor * solar_elevation * (1 + 0.3 * season_factor)
            solar_irradiance[i] = clear_sky * (1 - 0.6 * cloud_cover[i])
        else:
            solar_irradiance[i] = 0

    return {
        "temperature_c": temp,
        "humidity_pct": humidity,
        "cloud_cover_pct": cloud_cover * 100,
        "wind_speed_ms": wind_speed,
        "solar_irradiance_wm2": solar_irradiance * 1000,
    }
