import numpy as np
from datetime import datetime
from .config import DataConfig

def inject_anomalies(cfg: DataConfig, timestamps, load, solar, wind, market_prices, weather):
    n = len(timestamps)
    rng = np.random.default_rng(cfg.random_seed + 7)

    anomaly_mask = rng.random(n) < cfg.anomaly_fraction
    anomaly_indices = np.where(anomaly_mask)[0]

    for idx in anomaly_indices:
        ts = timestamps[idx]
        anomaly_type = rng.choice(["spike", "drop", "outage", "ramp"])
        severity = 1 + rng.exponential(0.5)

        if anomaly_type == "spike":
            load[idx] *= (1 + 0.3 * severity)
            if rng.random() > 0.5:
                solar[idx] *= max(0, 1 - 0.5 * severity)
                wind[idx] *= max(0, 1 - 0.4 * severity)
                weather["temperature_c"][idx] += 5 * severity
        elif anomaly_type == "drop":
            load[idx] *= max(0.3, 1 - 0.4 * severity)
            solar[idx] *= max(0, 1 - 0.3 * severity)
        elif anomaly_type == "outage":
            load[idx] *= 0.2
            solar[idx] *= 0.1
            wind[idx] *= 0.1
        elif anomaly_type == "ramp":
            ramp_len = rng.integers(1, 4)
            ramp_idx = min(idx + ramp_len, n - 1)
            slope = np.linspace(0, 0.5 * severity, ramp_idx - idx + 1)
            for j, offset in enumerate(range(idx, ramp_idx + 1)):
                if offset < n:
                    load[offset] *= (1 + slope[j])
                    market_prices[offset] *= (1 + 0.3 * slope[j])

    heatwave_start = rng.integers(180, 210)
    heatwave_len = rng.integers(3, 7)
    for i in range(n):
        ts = timestamps[i]
        doy = ts.timetuple().tm_yday
        if heatwave_start <= doy <= heatwave_start + heatwave_len:
            intensity = 8 + 4 * np.sin(2 * np.pi * (ts.hour - 14) / 24)
            weather["temperature_c"][i] += intensity
            load[i] *= (1 + 0.15 * (weather["temperature_c"][i] - 30) / 10)

    return load, solar, wind, market_prices, weather
