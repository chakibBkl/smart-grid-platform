import os
import pandas as pd
from datetime import datetime
from .config import DataConfig
from .weather import generate_weather
from .load import generate_load
from .solar import generate_solar
from .wind import generate_wind
from .market import generate_market_prices
from .battery import generate_battery_soc
from .anomalies import inject_anomalies

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def generate_all():
    cfg = DataConfig()
    timestamps = cfg.timestamps
    print(f"Generating {len(timestamps)} timestamps...")

    weather = generate_weather(cfg, timestamps)
    print("Weather generated.")

    load = generate_load(cfg, timestamps, weather)
    print("Load generated.")

    solar = generate_solar(cfg, timestamps, weather)
    print("Solar generated.")

    wind = generate_wind(cfg, timestamps, weather)
    print("Wind generated.")

    market_prices = generate_market_prices(cfg, timestamps, weather, load, solar, wind)
    print("Market prices generated.")

    load, solar, wind, market_prices, weather = inject_anomalies(
        cfg, timestamps, load, solar, wind, market_prices, weather
    )
    print("Anomalies injected.")

    battery_soc = generate_battery_soc(cfg, timestamps, load, solar, wind, market_prices)
    print("Battery SOC generated.")

    ts_str = [t.strftime("%Y-%m-%d %H:%M:%S") for t in timestamps]

    load_df = pd.DataFrame({
        "timestamp": ts_str,
        "load_mw": load.round(2),
        "industrial_load_mw": (load * 0.55 + 10).round(2),
        "commercial_load_mw": (load * 0.30 + 5).round(2),
        "residential_load_mw": (load * 0.15 + 3).round(2),
        "temperature_c": weather["temperature_c"].round(1),
    })

    solar_df = pd.DataFrame({
        "timestamp": ts_str,
        "solar_generation_mw": solar.round(2),
        "solar_irradiance_wm2": weather["solar_irradiance_wm2"].round(1),
        "cloud_cover_pct": weather["cloud_cover_pct"].round(1),
        "temperature_c": weather["temperature_c"].round(1),
    })

    wind_df = pd.DataFrame({
        "timestamp": ts_str,
        "wind_generation_mw": wind.round(2),
        "wind_speed_ms": weather["wind_speed_ms"].round(2),
        "temperature_c": weather["temperature_c"].round(1),
    })

    market_df = pd.DataFrame({
        "timestamp": ts_str,
        "price_per_mwh": market_prices.round(2),
        "load_mw": load.round(2),
        "solar_generation_mw": solar.round(2),
        "wind_generation_mw": wind.round(2),
        "net_load_mw": (load - solar - wind).round(2),
    })

    battery_df = pd.DataFrame({
        "timestamp": ts_str,
        "state_of_charge_mwh": battery_soc.round(2),
        "soc_percentage": (battery_soc / cfg.battery_capacity_mwh * 100).round(1),
        "load_mw": load.round(2),
        "solar_generation_mw": solar.round(2),
        "wind_generation_mw": wind.round(2),
        "market_price_per_mwh": market_prices.round(2),
    })

    os.makedirs(DATA_DIR, exist_ok=True)

    csv_files = {
        "load_data.csv": load_df,
        "solar_data.csv": solar_df,
        "wind_data.csv": wind_df,
        "market_data.csv": market_df,
        "battery_data.csv": battery_df,
    }

    for filename, df in csv_files.items():
        path = os.path.join(DATA_DIR, filename)
        df.to_csv(path, index=False)
        print(f"Saved {path} ({len(df):,} rows)")

    print(f"\nTotal timestamps generated: {len(load_df):,}")
    print("All datasets generated successfully!")

if __name__ == "__main__":
    generate_all()
