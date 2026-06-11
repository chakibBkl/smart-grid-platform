from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from .config import settings
from .database import init_db
from .core.websocket_manager import manager
from .api import auth, forecasting, market, optimization, rl, copilot, energy_data, dashboard, geo, operations

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    broadcast_task = asyncio.create_task(manager.start_realtime_broadcast())
    yield
    broadcast_task.cancel()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI Smart Grid and Energy Market Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(forecasting.router, prefix="/api/v1")
app.include_router(market.router, prefix="/api/v1")
app.include_router(optimization.router, prefix="/api/v1")
app.include_router(rl.router, prefix="/api/v1")
app.include_router(copilot.router, prefix="/api/v1")
app.include_router(energy_data.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(geo.router, prefix="/api/v1")
app.include_router(operations.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "auth": "/api/v1/auth",
            "forecasting": "/api/v1/forecasting",
            "market": "/api/v1/market",
            "optimization": "/api/v1/optimization",
            "rl": "/api/v1/rl",
            "copilot": "/api/v1/copilot",
            "energy": "/api/v1/energy",
            "dashboard": "/api/v1/dashboard",
            "geo": "/api/v1/geo",
            "operations": "/api/v1/operations",
            "websocket": "/ws",
        }
    }

@app.get("/health")
async def health_check():
    from datetime import datetime, timezone
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
