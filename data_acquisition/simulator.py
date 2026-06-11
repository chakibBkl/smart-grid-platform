import asyncio
import json
import random
import math
from datetime import datetime, timezone
from typing import Dict, Any


class SmartMeterSimulator:
    """Simulates real-time data from smart meters, solar PV, wind farm, and weather."""

    def __init__(self, meter_count: int = 5):
        self.meter_count = meter_count
        self.base_load = 500.0
        self.solar_capacity = 200.0
        self.wind_capacity = 150.0
        self.battery_capacity = 100.0
        self._step = 0

    def _get_time_features(self) -> Dict[str, float]:
        now = datetime.now(timezone.utc)
        hour = now.hour + now.minute / 60.0
        return {"hour": hour, "month": now.month, "day_of_week": now.weekday()}

    def _simulate_demand(self, tf: Dict[str, float]) -> float:
        hour = tf["hour"]
        peak_factor = 1.0 + 0.4 * math.sin(math.pi * (hour - 8) / 12)
        noise = random.gauss(0, self.base_load * 0.02)
        return max(0, self.base_load * peak_factor + noise)

    def _simulate_solar(self, tf: Dict[str, float]) -> float:
        hour = tf["hour"]
        day_factor = max(0, math.sin(math.pi * (hour - 6) / 12))
        seasonal = 1.0 + 0.3 * math.cos(2 * math.pi * (tf["month"] - 6) / 12)
        cloud = random.uniform(0.7, 1.0)
        noise = random.gauss(0, 2)
        return max(0, self.solar_capacity * day_factor * seasonal * cloud + noise)

    def _simulate_wind(self, tf: Dict[str, float]) -> float:
        base_wind_speed = 8.0 + 4 * math.sin(2 * math.pi * tf["hour"] / 24)
        gust = random.gauss(0, 1.5)
        wind_speed = max(0, base_wind_speed + gust)
        power = 0
        if 3 <= wind_speed <= 25:
            power = self.wind_capacity * ((wind_speed - 3) / 12)
        return max(0, min(self.wind_capacity, power + random.gauss(0, 2)))

    def _simulate_weather(self) -> Dict[str, float]:
        tf = self._get_time_features()
        hour = tf["hour"]
        temp_base = 15 + 8 * math.sin(math.pi * (hour - 14) / 12)
        temperature = temp_base + random.gauss(0, 1)
        irradiance = max(0, 800 * math.sin(math.pi * (hour - 6) / 12) + random.gauss(0, 30))
        wind_speed = 8.0 + 4 * math.sin(2 * math.pi * hour / 24) + random.gauss(0, 1.5)
        humidity = 50 + 20 * math.sin(math.pi * hour / 12) + random.gauss(0, 5)
        return {
            "temperature": round(temperature, 2),
            "irradiance": round(irradiance, 2),
            "wind_speed": round(max(0, wind_speed), 2),
            "humidity": round(max(0, min(100, humidity)), 2),
        }

    def _simulate_battery(self, net_load: float) -> Dict[str, float]:
        soc = 50.0 + 10 * math.sin(self._step * 0.05)
        soc = max(10, min(90, soc + random.gauss(0, 0.5)))
        charge_rate = 0
        discharge_rate = 0
        if net_load > 0:
            discharge_rate = min(20, net_load * 0.1)
        else:
            charge_rate = min(20, abs(net_load) * 0.1)
        return {
            "state_of_charge": round(soc, 1),
            "charge_rate_kw": round(charge_rate, 2),
            "discharge_rate_kw": round(discharge_rate, 2),
        }

    def _simulate_meters(self, demand: float) -> Dict[str, float]:
        meters = {}
        per_meter = demand / self.meter_count
        for i in range(self.meter_count):
            meters[f"meter_{i+1}_kw"] = round(per_meter + random.gauss(0, per_meter * 0.05), 2)
        return meters

    async def read_frame(self) -> Dict[str, Any]:
        self._step += 1
        tf = self._get_time_features()
        demand = self._simulate_demand(tf)
        solar = self._simulate_solar(tf)
        wind = self._simulate_wind(tf)
        weather = self._simulate_weather()
        net_load = demand - solar - wind
        battery = self._simulate_battery(net_load)
        meters = self._simulate_meters(demand)
        frequency = round(50.0 + random.gauss(0, 0.05), 3)
        voltage = round(230.0 + random.gauss(0, 2), 2)

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "demand_kw": round(demand, 2),
            "solar_generation_kw": round(solar, 2),
            "wind_generation_kw": round(wind, 2),
            "total_renewable_kw": round(solar + wind, 2),
            "net_load_kw": round(net_load, 2),
            "frequency_hz": frequency,
            "voltage_v": voltage,
            "battery": battery,
            "weather": weather,
            "meters": meters,
        }


class DataStreamer:
    """Streams simulated data over WebSocket."""

    def __init__(self, simulator: SmartMeterSimulator, interval: float = 5.0):
        self.simulator = simulator
        self.interval = interval
        self._running = False

    async def stream(self, websocket) -> None:
        self._running = True
        try:
            while self._running:
                frame = await self.simulator.read_frame()
                await websocket.send_text(json.dumps(frame))
                await asyncio.sleep(self.interval)
        except asyncio.CancelledError:
            self._running = False

    def stop(self) -> None:
        self._running = False
