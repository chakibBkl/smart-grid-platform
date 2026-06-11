import numpy as np
from .config import DataConfig

def generate_battery_soc(cfg: DataConfig, timestamps, load, solar, wind, market_prices):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 6)
    soc = np.zeros(n)
    soc[0] = 0.5 * cfg.battery_capacity_mwh

    for i in range(1, n):
        hour = timestamps[i].hour
        price = market_prices[i]
        net_gen = solar[i] + wind[i]
        net_demand = load[i]
        excess = net_gen - net_demand

        if price > 60 or excess > 10:
            charge_power = min(cfg.max_charge_rate_mw, excess * 0.5)
            charge_power = min(charge_power, (cfg.battery_capacity_mwh - soc[i-1]) / cfg.charge_efficiency)
            charge_power = max(0, charge_power)
            soc[i] = soc[i-1] + charge_power * cfg.charge_efficiency
        elif price < 20 or (hour >= 18 and soc[i-1] > 5):
            discharge_power = min(cfg.max_discharge_rate_mw, soc[i-1] * cfg.discharge_efficiency)
            soc[i] = soc[i-1] - discharge_power / cfg.discharge_efficiency
        else:
            loss = 0.001 * cfg.battery_capacity_mwh
            soc[i] = max(0, soc[i-1] - loss + rng.normal(0, 0.1))

        soc[i] = np.clip(soc[i], 0, cfg.battery_capacity_mwh)

    return soc
