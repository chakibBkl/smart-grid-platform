from fastapi import WebSocket
from typing import Set
import json
import asyncio
import numpy as np
from datetime import datetime, timezone

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.add(connection)
        self.active_connections -= dead

    async def start_realtime_broadcast(self):
        while True:
            now = datetime.now(timezone.utc)
            hour = now.hour + now.minute / 60
            data = {
                "type": "realtime_update",
                "load_mw": round(50 + 15 * np.sin(2 * np.pi * (hour - 6) / 24) + np.random.normal(0, 3), 2),
                "solar_mw": round(max(0, 30 * np.sin(2 * np.pi * (hour - 6) / 12) + np.random.normal(0, 2)), 2),
                "wind_mw": round(20 + np.random.normal(0, 5), 2),
                "price_per_mwh": round(45 + 15 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 5), 2),
                "battery_soc": round(50 + np.random.normal(0, 5), 1),
                "timestamp": now.isoformat(),
            }
            await self.broadcast(data)
            await asyncio.sleep(5)

manager = ConnectionManager()
