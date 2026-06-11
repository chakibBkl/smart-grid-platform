# Smart Grid Control Platform

AI-driven smart grid platform for real-time monitoring, forecasting, control, and market optimization.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Data Simulator │────▶│  FastAPI Backend  │────▶│  React Dashboard│
│  (WebSocket)    │     │  (Port 8000)     │     │  (Port 3000)   │
└─────────────────┘     └──────────────────┘     └────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              ┌─────────┐ ┌──────┐ ┌────────┐
              │  Redis  │ │ PG  │ │ Models │
              │ (Cache) │ │(DB) │ │ (Disk) │
              └─────────┘ └──────┘ └────────┘
```

## Components

| Module | Description |
|--------|-------------|
| `data_acquisition/` | Simulates smart meters, solar PV, wind farm, weather data over WebSocket |
| `data_processing/` | Data cleaning, normalization, feature extraction, anomaly detection |
| `forecasting/lstm_model.py` | LSTM-based load forecasting (24h in → 6h out) |
| `forecasting/renewable.py` | Random Forest hybrid model for solar/wind forecasting |
| `rl_agent/` | PPO agent for grid voltage control (Stable-Baselines3) |
| `market/` | XGBoost day-ahead electricity price predictor |
| `optimization/` | SciPy optimal dispatch and trading schedule solver |
| `dashboard/` | Real-time React + Plotly dashboard |

## Setup & Run

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

This starts:
- **API**: http://localhost:8000 (docs at /docs)
- **Dashboard**: http://localhost:3000
- **Redis** (cache) on port 6379
- **PostgreSQL** (storage) on port 5432

### Option 2: Manual

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd dashboard && npm install && npm start
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | System health check |
| GET | `/status` | Current system status |
| GET | `/forecast/load` | Latest load forecast |
| GET | `/forecast/renewable` | Solar & wind forecast |
| GET | `/market/prices` | Market price predictions |
| GET | `/control/action` | Latest RL control action |
| POST | `/train/load` | Train LSTM load forecaster |
| POST | `/train/renewable` | Train renewable forecaster |
| POST | `/train/market` | Train market price predictor |
| POST | `/train/rl` | Train RL grid controller |
| WS | `/ws` | Real-time data stream |

## WebSocket Protocol

The backend streams JSON messages over `/ws`:

```json
{"type": "telemetry", "data": { ... }}
{"type": "forecast", "data": { ... }}
{"type": "market_update", "data": { ... }}
{"type": "rl_control", "data": { ... }}
```

## Data Flow

1. **Data Acquisition** (every 5s): Simulated meters + weather streamed via WebSocket
2. **Load Forecasting** (every 60min): LSTM predicts next 6h of demand
3. **Renewable Forecasting** (every 60min): RF predicts solar/wind for next 3h
4. **RL Control** (every 5min): PPO agent optimizes voltage regulation
5. **Market Optimization** (every 30min): Solves optimal dispatch + trading schedule
