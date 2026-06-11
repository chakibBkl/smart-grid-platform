import numpy as np
from typing import Optional, List, Dict, Any, Tuple
from scipy.optimize import minimize, Bounds


class GridOptimizer:
    """Optimization module for optimal dispatch and trading schedule.

    Minimizes: C_gen + C_purchase + C_losses - R_market
    Subject to: power balance, line limits, storage constraints, market limits.
    """

    def __init__(
        self,
        n_generators: int = 3,
        n_hours: int = 24,
        gen_cost: Optional[List[float]] = None,
        gen_min: Optional[List[float]] = None,
        gen_max: Optional[List[float]] = None,
        line_limit: float = 500.0,
        storage_capacity: float = 100.0,
        storage_max_charge: float = 20.0,
        storage_max_discharge: float = 20.0,
        market_buy_limit: float = 300.0,
        market_sell_limit: float = 300.0,
    ):
        self.n_generators = n_generators
        self.n_hours = n_hours
        self.gen_cost = gen_cost or [30, 50, 80]
        self.gen_min = gen_min or [20, 10, 10]
        self.gen_max = gen_max or [200, 150, 100]
        self.line_limit = line_limit
        self.storage_capacity = storage_capacity
        self.storage_max_charge = storage_max_charge
        self.storage_max_discharge = storage_max_discharge
        self.market_buy_limit = market_buy_limit
        self.market_sell_limit = market_sell_limit

    def _build_vars(self) -> Dict[str, Tuple[int, int]]:
        gen_start = 0
        gen_end = gen_start + self.n_generators * self.n_hours
        storage_start = gen_end
        storage_end = storage_start + self.n_hours
        market_start = storage_end
        market_end = market_start + self.n_hours
        return {
            "gen": (gen_start, gen_end),
            "storage": (storage_start, storage_end),
            "market": (market_start, market_end),
        }

    def _objective(self, x: np.ndarray, market_prices: np.ndarray) -> float:
        vars = self._build_vars()
        g_start, g_end = vars["gen"]
        s_start, s_end = vars["storage"]
        m_start, m_end = vars["market"]

        gen = x[g_start:g_end].reshape(self.n_hours, self.n_generators)
        storage = x[s_start:s_end]
        market = x[m_start:m_end]

        gen_cost = sum(
            self.gen_cost[g] * gen[h, g]
            for h in range(self.n_hours)
            for g in range(self.n_generators)
        )
        market_cost = sum(max(0, m) * market_prices[h] for h, m in enumerate(market))
        market_revenue = sum(max(0, -m) * market_prices[h] * 0.95 for h, m in enumerate(market))
        losses = sum(0.01 * gen[h, g] ** 2 for h in range(self.n_hours) for g in range(self.n_generators))

        return float(gen_cost + market_cost + losses - market_revenue)

    def _power_balance_constraint(self, x: np.ndarray, load: np.ndarray, renewable: np.ndarray) -> np.ndarray:
        vars = self._build_vars()
        g_start, g_end = vars["gen"]
        s_start, s_end = vars["storage"]
        m_start, m_end = vars["market"]

        gen = x[g_start:g_end].reshape(self.n_hours, self.n_generators)
        storage = x[s_start:s_end]
        market = x[m_start:m_end]

        total_gen = gen.sum(axis=1)
        net_load = load - renewable
        return total_gen + storage + market - net_load

    # Build all constraints as a single flat function
    def _constraints(self, x: np.ndarray, load: np.ndarray, renewable: np.ndarray) -> np.ndarray:
        balance = self._power_balance_constraint(x, load, renewable)
        return balance

    def solve(
        self,
        load_forecast: np.ndarray,
        renewable_forecast: np.ndarray,
        market_prices: np.ndarray,
        initial_soc: float = 50.0,
    ) -> Dict[str, Any]:
        """Solve optimal dispatch.

        Args:
            load_forecast: shape (n_hours,)
            renewable_forecast: shape (n_hours,)
            market_prices: shape (n_hours,)
            initial_soc: initial state of charge in percent

        Returns:
            dict with dispatch schedule
        """
        vars = self._build_vars()
        n_vars = sum(end - start for start, end in vars.values())

        bounds = Bounds(
            [0] * n_vars,
            [1] * n_vars,
        )

        g_start, g_end = vars["gen"]
        s_start, s_end = vars["storage"]
        m_start, m_end = vars["market"]

        lb = np.full(n_vars, -np.inf)
        ub = np.full(n_vars, np.inf)

        for g in range(self.n_generators):
            for h in range(self.n_hours):
                idx = g_start + g * self.n_hours + h
                lb[idx] = self.gen_min[g]
                ub[idx] = self.gen_max[g]

        for h in range(self.n_hours):
            idx = s_start + h
            lb[idx] = -self.storage_max_discharge
            ub[idx] = self.storage_max_charge

        for h in range(self.n_hours):
            idx = m_start + h
            lb[idx] = -self.market_sell_limit
            ub[idx] = self.market_buy_limit

        bounds = Bounds(lb, ub)

        soc_init_kwh = initial_soc / 100.0 * self.storage_capacity
        soc_kwh = np.full(self.n_hours + 1, soc_init_kwh)
        soc_kwh[1:] = soc_init_kwh

        x0 = np.clip(np.ones(n_vars) * 50, lb, ub)
        x0[s_start:s_end] = 0

        result = minimize(
            lambda x: self._objective(x, market_prices),
            x0,
            method="SLSQP",
            bounds=bounds,
            constraints=[{"type": "eq", "fun": lambda x: self._constraints(x, load_forecast, renewable_forecast)}],
            options={"maxiter": 1000, "ftol": 1e-6},
        )

        if not result.success:
            return {"status": "failed", "message": result.message}

        x = result.x
        gen = x[g_start:g_end].reshape(self.n_hours, self.n_generators)
        storage = x[s_start:s_end]
        market = x[m_start:m_end]

        schedule = []
        for h in range(self.n_hours):
            soc_pct = float(soc_kwh[h] / self.storage_capacity * 100) if h < len(soc_kwh) else 0
            schedule.append({
                "hour": h,
                "generation_mw": [float(gen[h, g]) for g in range(self.n_generators)],
                "total_generation_mw": float(gen[h].sum()),
                "storage_mw": float(storage[h]),
                "market_trade_mw": float(market[h]),
                "action": "buy" if market[h] > 0 else "sell",
                "soc_pct": round(soc_pct, 1),
                "market_price": float(market_prices[h]),
            })
            if h < self.n_hours - 1:
                soc_kwh[h + 1] = soc_kwh[h] - storage[h] * 0.25

        return {
            "status": "success",
            "objective_value": float(result.fun),
            "schedule": schedule,
            "total_gen_cost": float(sum(
                self.gen_cost[g] * gen[h, g]
                for h in range(self.n_hours)
                for g in range(self.n_generators)
            )),
            "total_market_trades": float(np.sum(np.abs(market))),
        }
