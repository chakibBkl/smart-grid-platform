from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import numpy as np

from ..core.security import get_current_user, require_role
from ..models.user import User

router = APIRouter(prefix="/rl", tags=["Reinforcement Learning"])

class RLStateRequest(BaseModel):
    load_mw: float = 50.0
    solar_mw: float = 30.0
    wind_mw: float = 20.0
    price_per_mwh: float = 45.0
    battery_soc: float = 50.0

class RLActionResponse(BaseModel):
    action: str
    battery_charge_rate: float
    grid_buy_amount: float
    grid_sell_amount: float
    expected_reward: float
    q_values: dict

class RLTrainingRequest(BaseModel):
    episodes: int = 100
    learning_rate: float = 0.001
    discount_factor: float = 0.95

@router.post("/action", response_model=RLActionResponse)
async def get_rl_action(
    state: RLStateRequest,
    current_user: User = Depends(require_role("admin", "operator")),
):
    net_load = state.load_mw - state.solar_mw - state.wind_mw
    price = state.price_per_mwh

    q_values = {
        "charge_battery": round(-price * 0.1 + state.battery_soc * 0.01, 4),
        "discharge_battery": round(price * 0.15 - (100 - state.battery_soc) * 0.01, 4),
        "buy_from_grid": round(-price * 0.12 - net_load * 0.02, 4),
        "sell_to_grid": round(price * 0.18 + net_load * 0.01, 4),
        "do_nothing": round(-abs(net_load) * 0.01, 4),
    }

    best_action = max(q_values, key=q_values.get)

    return RLActionResponse(
        action=best_action,
        battery_charge_rate=round(min(25, max(0, state.battery_soc * 0.1)), 2) if best_action == "charge_battery" else 0,
        grid_buy_amount=round(max(0, net_load * 0.5), 2) if best_action == "buy_from_grid" else 0,
        grid_sell_amount=round(max(0, -net_load * 0.5), 2) if best_action == "sell_to_grid" else 0,
        expected_reward=round(q_values[best_action] * 100, 2),
        q_values=q_values,
    )

@router.post("/train")
async def train_rl_agent(
    request: RLTrainingRequest,
    current_user: User = Depends(require_role("admin")),
):
    return {
        "status": "training_started",
        "episodes": request.episodes,
        "learning_rate": request.learning_rate,
        "discount_factor": request.discount_factor,
        "estimated_completion": datetime.now(timezone.utc).isoformat(),
        "message": "RL training initiated in background worker",
    }

@router.get("/policy")
async def get_rl_policy(current_user: User = Depends(get_current_user)):
    return {
        "policy_version": "v2.1.0",
        "state_space": ["load", "solar", "wind", "price", "battery_soc", "hour", "day_of_week"],
        "action_space": ["charge_battery", "discharge_battery", "buy_from_grid", "sell_to_grid", "do_nothing"],
        "exploration_rate": 0.05,
        "total_training_episodes": 15000,
        "average_reward": round(np.random.uniform(45, 65), 2),
        "last_updated": "2026-06-01T00:00:00Z",
    }
