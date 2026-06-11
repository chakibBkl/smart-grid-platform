import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from data_acquisition.simulator import SmartMeterSimulator, DataStreamer
from data_processing.processor import DataProcessor
from forecasting.lstm_model import LoadForecaster
from forecasting.renewable import RenewableForecaster
from rl_agent.grid_controller import GridController
from market.price_predictor import MarketPricePredictor
from optimization.dispatcher import GridOptimizer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_WINDOW_SIZE = 288
FORECAST_INTERVAL = 3600
RL_INTERVAL = 300
MARKET_INTERVAL = 1800


class SmartGridPlatform:
    """Main integration class for the smart grid platform."""

    def __init__(self):
        self.simulator = SmartMeterSimulator(meter_count=5)
        self.streamer = DataStreamer(self.simulator, interval=5.0)
        self.processor = DataProcessor()
        self.load_forecaster = LoadForecaster()
        self.renewable_forecaster = RenewableForecaster()
        self.grid_controller = GridController()
        self.market_predictor = MarketPricePredictor()
        self.optimizer = GridOptimizer()

        self.data_buffer: list = []
        self.last_forecast_time: float = 0
        self.last_rl_time: float = 0
        self.last_market_time: float = 0
        self.latest_frame: Optional[dict] = None
        self.forecast_cache: dict = {}
        self.market_decision_cache: dict = {}
        self.connected_clients: list = []

    async def ingest_frame(self, frame: dict) -> None:
        self.latest_frame = frame
        self.data_buffer.append(frame)
        if len(self.data_buffer) > DATA_WINDOW_SIZE:
            self.data_buffer.pop(0)

    def get_dataframe(self) -> pd.DataFrame:
        return pd.DataFrame(self.data_buffer)

    async def run_forecast(self) -> dict:
        df = self.get_dataframe()
        if len(df) < 24:
            return {"status": "skipped", "reason": "insufficient data"}

        df_proc = self.processor.process_pipeline(df)
        X, _ = self.load_forecaster.prepare_data(df_proc)
        if len(X) == 0:
            return {"status": "skipped", "reason": "no windows"}

        last_window = X[-1:]
        if self.load_forecaster.model is not None:
            load_pred = self.load_forecaster.predict(last_window)[0]
        else:
            load_pred = [df_proc["demand_kw"].iloc[-1]] * 24

        recent_weather = df_proc[["temperature", "irradiance", "wind_speed", "humidity"]].iloc[-3:].values if len(df_proc) >= 3 else None
        renewable_pred = {"solar_kw": [], "wind_kw": []}
        if recent_weather is not None and self.renewable_forecaster.solar_model is not None:
            renewable_pred = self.renewable_forecaster.predict_hourly(recent_weather)

        self.forecast_cache = {
            "load_forecast_kw": [float(x) for x in load_pred[:24]],
            "renewable_forecast": renewable_pred,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        return self.forecast_cache

    async def run_rl_control(self) -> dict:
        if self.grid_controller.model is None:
            loaded = self.grid_controller.load()
            if not loaded:
                return {"status": "skipped", "reason": "no trained model"}
        obs = np.random.uniform(0.95, 1.05, 14).astype(np.float32)
        action = self.grid_controller.control(obs)
        return {
            "status": "success",
            "tap_change": float(action[0]),
            "battery_rate": float(action[1]),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def run_market_optimization(self) -> dict:
        df = self.get_dataframe()
        if len(df) < 24:
            return {"status": "skipped", "reason": "insufficient data"}

        load_forecast = np.array(self.forecast_cache.get("load_forecast_kw", [df["demand_kw"].iloc[-1]] * 24))
        renewable_forecast = np.array(self.forecast_cache.get("renewable_forecast", {}).get("solar_kw", [0] * 24))
        renewable_forecast += np.array(self.forecast_cache.get("renewable_forecast", {}).get("wind_kw", [0] * 24))

        market_prices = np.linspace(30, 80, 24) + np.random.normal(0, 5, 24)

        result = self.optimizer.solve(load_forecast, renewable_forecast, market_prices)
        self.market_decision_cache = result
        return result

    async def broadcast(self, message: dict) -> None:
        dead = []
        for ws in self.connected_clients:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.connected_clients.remove(ws)


platform = SmartGridPlatform()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Smart Grid Platform...")
    asyncio.create_task(background_scheduler())
    yield
    logger.info("Shutting down Smart Grid Platform...")


app = FastAPI(
    title="Smart Grid Control Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def background_scheduler():
    """Background task that runs periodic operations."""
    while True:
        try:
            now = datetime.now(timezone.utc).timestamp()

            if now - platform.last_forecast_time >= FORECAST_INTERVAL:
                logger.info("Running forecast cycle...")
                result = await platform.run_forecast()
                platform.last_forecast_time = now
                await platform.broadcast({"type": "forecast", "data": result})

            if now - platform.last_rl_time >= RL_INTERVAL:
                logger.info("Running RL control cycle...")
                result = await platform.run_rl_control()
                platform.last_rl_time = now
                await platform.broadcast({"type": "rl_control", "data": result})

            if now - platform.last_market_time >= MARKET_INTERVAL:
                logger.info("Running market optimization cycle...")
                result = await platform.run_market_optimization()
                platform.last_market_time = now
                await platform.broadcast({"type": "market_update", "data": result})

        except Exception as e:
            logger.error(f"Scheduler error: {e}")

        await asyncio.sleep(5)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    platform.connected_clients.append(websocket)
    logger.info(f"WebSocket client connected. Total: {len(platform.connected_clients)}")

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "command":
                if msg.get("command") == "force_forecast":
                    result = await platform.run_forecast()
                    await websocket.send_json({"type": "forecast", "data": result})
                elif msg.get("command") == "force_market":
                    result = await platform.run_market_optimization()
                    await websocket.send_json({"type": "market_update", "data": result})
                elif msg.get("command") == "force_rl":
                    result = await platform.run_rl_control()
                    await websocket.send_json({"type": "rl_control", "data": result})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        platform.connected_clients.remove(websocket)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data_buffer_size": len(platform.data_buffer),
        "connected_clients": len(platform.connected_clients),
        "models_loaded": {
            "load_forecaster": platform.load_forecaster.model is not None,
            "solar_forecaster": platform.renewable_forecaster.solar_model is not None,
            "wind_forecaster": platform.renewable_forecaster.wind_model is not None,
            "grid_controller": platform.grid_controller.model is not None,
            "market_predictor": platform.market_predictor.model is not None,
        },
    }


@app.get("/status")
async def system_status():
    return {
        "latest_telemetry": platform.latest_frame,
        "forecast_cache": platform.forecast_cache,
        "market_decisions": platform.market_decision_cache,
        "data_points": len(platform.data_buffer),
    }


@app.get("/forecast/load")
async def forecast_load():
    if not platform.forecast_cache.get("load_forecast_kw"):
        return JSONResponse({"status": "no forecast available"}, status_code=503)
    return platform.forecast_cache


@app.get("/forecast/renewable")
async def forecast_renewable():
    if platform.renewable_forecaster.solar_model is None:
        return JSONResponse({"status": "model not trained", "detail": "Train the renewable forecaster first"}, status_code=503)
    df = platform.get_dataframe()
    if len(df) < 3:
        return JSONResponse({"status": "insufficient data"}, status_code=503)
    df_proc = platform.processor.process_pipeline(df)
    weather = df_proc[["temperature", "irradiance", "wind_speed", "humidity"]].iloc[-3:].values
    result = platform.renewable_forecaster.predict_hourly(weather)
    return {"forecast": result, "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/market/prices")
async def market_prices():
    if not platform.market_decision_cache:
        return JSONResponse({"status": "no market data available"}, status_code=503)
    return platform.market_decision_cache


@app.get("/control/action")
async def control_action():
    result = await platform.run_rl_control()
    return result


@app.post("/train/load")
async def train_load_forecaster(background_tasks: BackgroundTasks):
    df = platform.get_dataframe()
    if len(df) < 48:
        return JSONResponse({"status": "insufficient data", "required": 48, "available": len(df)}, status_code=400)

    def train():
        df_proc = platform.processor.process_pipeline(df, fit_scaler=True)
        forecaster = LoadForecaster()
        X, y = forecaster.prepare_data(df_proc)
        if len(X) > 10:
            forecaster._build_model(n_features=X.shape[2])
            result = forecaster.train(X, y, epochs=50)
            platform.load_forecaster.model = forecaster.model
            logger.info(f"Load forecaster trained: {result}")

    background_tasks.add_task(train)
    return {"status": "training_started", "samples": len(df)}


@app.post("/train/renewable")
async def train_renewable_forecaster(background_tasks: BackgroundTasks):
    df = platform.get_dataframe()
    if len(df) < 48:
        return JSONResponse({"status": "insufficient data"}, status_code=400)
    df_proc = platform.processor.process_pipeline(df)

    def train():
        forecaster = RenewableForecaster()
        forecaster.train(df_proc)
        platform.renewable_forecaster.solar_model = forecaster.solar_model
        platform.renewable_forecaster.wind_model = forecaster.wind_model
        logger.info("Renewable forecaster trained")

    background_tasks.add_task(train)
    return {"status": "training_started"}


@app.post("/train/market")
async def train_market_predictor(background_tasks: BackgroundTasks):
    df = platform.get_dataframe()
    if len(df) < 168:
        return JSONResponse({"status": "insufficient data", "required": 168}, status_code=400)

    def train():
        predictor = MarketPricePredictor()
        lag_df = df.copy()
        for h in range(1, 169):
            lag_df[f"lag_price_{h}"] = df["demand_kw"].shift(h)
        lag_df["forecasted_load"] = df["demand_kw"]
        lag_df["forecasted_renewable"] = df["solar_generation_kw"] + df["wind_generation_kw"]
        ts = pd.to_datetime(df["timestamp"])
        lag_df["day_of_week"] = ts.dt.dayofweek
        lag_df["is_holiday"] = 0
        lag_df["price_per_mwh"] = 30 + 20 * (df["demand_kw"] / df["demand_kw"].max()) + np.random.normal(0, 2, len(df))
        lag_df = lag_df.dropna()
        predictor.train(lag_df)
        platform.market_predictor.model = predictor.model
        logger.info("Market predictor trained")

    background_tasks.add_task(train)
    return {"status": "training_started"}


@app.post("/train/rl")
async def train_rl_agent(background_tasks: BackgroundTasks):
    def train():
        controller = GridController()
        result = controller.train(total_timesteps=20000)
        platform.grid_controller.model = controller.model
        logger.info(f"RL agent trained: {result}")

    background_tasks.add_task(train)
    return {"status": "training_started"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
