import numpy as np
from .config import DataConfig

def generate_market_prices(cfg: DataConfig, timestamps, weather, load, solar, wind):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 5)
    prices = np.zeros(n)

    net_load = load - solar - wind
    net_load_norm = (net_load - net_load.mean()) / net_load.std()

    for i, ts in enumerate(timestamps):
        hour = ts.hour + ts.minute / 60
        day_of_week = ts.weekday()

        base = cfg.base_price_per_mwh
        peak = cfg.peak_price_premium * (1 if 7 <= hour <= 22 and day_of_week < 5 else 0.4)
        load_effect = 15 * net_load_norm[i]
        temp_effect = max(0, (weather["temperature_c"][i] - 30) * 2)
        renewable_effect = -8 * ((solar[i] + wind[i]) / (cfg.solar_capacity_mw + cfg.wind_capacity_mw))
        noise = rng.normal(0, cfg.price_noise_std)

        price = base + peak + load_effect + temp_effect + renewable_effect + noise
        prices[i] = max(0, price)

    spike_mask = rng.random(n) < 0.005
    prices = np.where(spike_mask, prices * (2 + rng.exponential(1, n)), prices)
    negative_mask = rng.random(n) < 0.01
    prices = np.where(negative_mask & (net_load < 0), -rng.uniform(1, 10, n), prices)
    return prices
