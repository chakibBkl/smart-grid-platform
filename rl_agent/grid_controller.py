import os
import numpy as np
from typing import Optional, Tuple, Dict, Any
from gymnasium import Env, spaces
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
PPO_MODEL_PATH = os.path.join(MODEL_DIR, "grid_controller_ppo.zip")


class GridVoltageControlEnv(Env):
    """Reinforcement Learning environment for smart grid voltage control.

    State: bus voltages (p.u.), line currents (p.u.), generator outputs (MW)
    Action: tap changer position (continuous), battery charge/discharge rate (continuous)
    Reward: negative voltage deviation + penalty for line overload
    """

    def __init__(self, n_buses: int = 5, n_lines: int = 7, n_generators: int = 2):
        super().__init__()

        self.n_buses = n_buses
        self.n_lines = n_lines
        self.n_generators = n_generators

        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf,
            shape=(n_buses + n_lines + n_generators + 2,),
            dtype=np.float32,
        )

        self.action_space = spaces.Box(
            low=np.array([-1.0, -1.0]),
            high=np.array([1.0, 1.0]),
            dtype=np.float32,
        )

        self._reset_state()

    def _reset_state(self) -> None:
        self.voltages = np.random.uniform(0.95, 1.05, self.n_buses).astype(np.float32)
        self.currents = np.random.uniform(0.3, 0.8, self.n_lines).astype(np.float32)
        self.generator_outputs = np.random.uniform(50, 200, self.n_generators).astype(np.float32)
        self.tap_position = 0.0
        self.battery_rate = 0.0

    def _get_obs(self) -> np.ndarray:
        return np.concatenate([
            self.voltages,
            self.currents,
            self.generator_outputs,
            [self.tap_position, self.battery_rate],
        ]).astype(np.float32)

    def reset(self, *, seed: Optional[int] = None, options: Optional[Dict] = None) -> Tuple[np.ndarray, Dict]:
        super().reset(seed=seed)
        self._reset_state()
        return self._get_obs(), {}

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        tap_change = float(action[0]) * 0.02
        battery_change = float(action[1]) * 10.0

        self.tap_position = np.clip(self.tap_position + tap_change, -1.0, 1.0)
        self.battery_rate = np.clip(self.battery_rate + battery_change * 0.1, -10.0, 10.0)

        voltage_effect = self.tap_position * 0.02
        battery_effect = self.battery_rate * 0.001

        noise_v = np.random.normal(0, 0.005, self.n_buses)
        self.voltages = np.clip(
            self.voltages + voltage_effect + battery_effect + noise_v,
            0.90, 1.10,
        ).astype(np.float32)

        load_fluctuation = np.random.normal(0, 0.02, self.n_lines)
        self.currents = np.clip(
            self.currents * (1 + battery_effect * 0.1) + load_fluctuation,
            0.1, 1.2,
        ).astype(np.float32)

        noise_g = np.random.normal(0, 2, self.n_generators)
        self.generator_outputs = np.clip(
            self.generator_outputs + noise_g,
            20, 250,
        ).astype(np.float32)

        voltage_deviation = np.mean(np.abs(self.voltages - 1.0))
        line_overload = np.mean(np.clip(self.currents - 0.95, 0, 1))
        tap_penalty = 0.01 * abs(self.tap_position)
        battery_penalty = 0.005 * abs(self.battery_rate)

        reward = -10.0 * voltage_deviation - 5.0 * line_overload - tap_penalty - battery_penalty

        terminated = bool(voltage_deviation > 0.08 or line_overload > 0.3)
        truncated = False

        return self._get_obs(), float(reward), terminated, truncated, {
            "voltage_deviation": float(voltage_deviation),
            "line_overload": float(line_overload),
        }

    def render(self) -> None:
        dev = np.mean(np.abs(self.voltages - 1.0))
        overload = np.mean(np.clip(self.currents - 0.95, 0, 1))
        print(f"V_dev={dev:.4f}  overload={overload:.4f}  tap={self.tap_position:.2f}  bat={self.battery_rate:.2f}")


class GridController:
    """PPO-based grid controller agent."""

    def __init__(self):
        self.model = None
        self.env: Optional[GridVoltageControlEnv] = None

    def train(
        self,
        total_timesteps: int = 50000,
        n_buses: int = 5,
        n_lines: int = 7,
        n_generators: int = 2,
    ) -> Dict[str, Any]:
        self.env = GridVoltageControlEnv(n_buses, n_lines, n_generators)
        vec_env = DummyVecEnv([lambda: self.env])

        self.model = PPO(
            "MlpPolicy",
            vec_env,
            learning_rate=0.0003,
            n_steps=2048,
            batch_size=64,
            n_epochs=10,
            gamma=0.99,
            verbose=1,
        )
        self.model.learn(total_timesteps=total_timesteps)
        self.save()

        return {"total_timesteps": total_timesteps, "policy": "MlpPolicy"}

    def control(self, observation: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() or train() first.")
        action, _ = self.model.predict(observation, deterministic=True)
        return action

    def save(self, path: str = PPO_MODEL_PATH) -> str:
        if self.model is None:
            raise RuntimeError("No model to save.")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.model.save(path)
        return path

    def load(self, path: str = PPO_MODEL_PATH) -> bool:
        if not os.path.exists(path):
            return False
        self.model = PPO.load(path)
        return True
