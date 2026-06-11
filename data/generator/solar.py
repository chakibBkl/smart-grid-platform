import numpy as np
from .config import DataConfig

def generate_solar(cfg: DataConfig, timestamps, weather):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 3)
    solar = np.zeros(n)

    for i in range(n):
        irradiance = weather["solar_irradiance_wm2"][i]
        cloud = weather["cloud_cover_pct"][i] / 100

        intermittency = 1 + rng.normal(0, 0.05)
        cloud_effect = (1 - 0.7 * cloud) * (1 + rng.normal(0, 0.03))
        cloud_effect = np.clip(cloud_effect, 0, 1)
        degradation = 1 - 0.005 * rng.random()

        solar_gen = (cfg.solar_capacity_mw * irradiance / 1000 *
                     cloud_effect * intermittency * degradation)
        solar[i] = max(0, solar_gen)
    return solar
