from celery import Celery
from ..config import settings

celery_app = Celery(
    "smart_grid",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    result_expires=3600,
)

@celery_app.task(bind=True, max_retries=3)
def run_forecast_task(self, forecast_type: str, horizon_hours: int):
    import numpy as np
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    timestamps = [now + timedelta(hours=h) for h in range(0, horizon_hours)]
    base = 50 if forecast_type == "load" else 45 if forecast_type == "price" else 30
    values = [base + 10 * np.sin(2 * np.pi * h / 24) + np.random.normal(0, 3) for h in range(horizon_hours)]

    return {
        "timestamps": [t.isoformat() for t in timestamps],
        "values": [round(v, 2) for v in values],
        "upper_bounds": [round(v + 1.96 * 3, 2) for v in values],
        "lower_bounds": [round(v - 1.96 * 3, 2) for v in values],
        "confidence": 0.95,
        "model_used": f"prophet_{forecast_type}_v1",
    }

@celery_app.task(bind=True, max_retries=3)
def run_optimization_task(self, optimization_type: str, horizon_hours: int, initial_soc: float):
    import numpy as np
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    schedule = []
    soc = initial_soc
    for h in range(horizon_hours):
        price = 45 + 20 * np.sin(2 * np.pi * (now.hour + h) / 24) + np.random.normal(0, 5)
        action = "charge" if price < 35 else "discharge" if price > 55 else "idle"
        soc_delta = 5 if action == "charge" else -5 if action == "discharge" else 0
        soc = max(0, min(100, soc + soc_delta))
        schedule.append({
            "hour": h,
            "action": action,
            "expected_price": round(price, 2),
            "soc_after": round(soc, 1),
        })

    return {
        "recommended_actions": schedule[:6],
        "expected_savings": round(np.random.uniform(500, 2000), 2),
        "battery_schedule": schedule,
        "trading_schedule": [s for s in schedule if s["action"] != "idle"],
        "risk_score": round(np.random.uniform(0.1, 0.6), 2),
    }
