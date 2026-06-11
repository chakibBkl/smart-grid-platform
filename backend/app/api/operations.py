from fastapi import APIRouter

router = APIRouter(prefix="/operations", tags=["Operations"])


@router.get("/summary")
async def operations_summary():
    return {
        "actions": [
            {
                "priority": "High",
                "title": "Evening peak pressure expected",
                "recommended_action": "Discharge battery from 18:00 to 21:00",
                "deadline": "18:00",
                "status": "Pending",
                "expected_impact": "Reduce peak pressure by 12%",
            }
        ],
        "energy_balance": {
            "total_demand_mw": 520,
            "solar_mw": 180,
            "wind_mw": 90,
            "battery_mw": 40,
            "conventional_support_mw": 225,
            "total_supply_mw": 535,
            "reserve_margin_pct": 2.8,
            "balance_status": "Tight",
        },
        "anomalies": [
            {
                "type": "Load anomaly",
                "severity": "High",
                "region": "Algiers",
                "description": "Unusual load spike detected in Algiers",
                "possible_cause": "Evening consumption peak and high temperature",
                "recommended_action": "Activate peak shaving scenario",
                "timestamp": "17:45",
            }
        ],
        "forecast_confidence": {
            "load": 91,
            "solar": 87,
            "wind": 82,
            "price": 76,
            "mape": 4.8,
            "rmse_mw": 2.1,
            "data_quality": 93,
            "model": "LSTM Load Forecast v1",
            "last_updated": "2026-06-10 03:38",
        },
        "asset_health": [
            {"name": "Battery Health", "value": "84%", "status": "Normal"},
            {"name": "Wind Site", "value": "Warning", "status": "Warning"},
        ],
        "data_sources": [
            {"name": "CSV Demo Data", "status": "Active", "last_update": "03:38", "data_quality": 95},
            {"name": "Weather Feed", "status": "Simulated", "last_update": "03:35", "data_quality": 88},
        ],
        "weather_impact": {
            "impact": "Medium",
            "solar_impact_pct": -18,
            "wind_impact_pct": 9,
            "heat_load_impact_pct": 12,
            "most_affected_region": "Hassi Messaoud",
            "recommended_action": "Prepare battery support during evening peak",
        },
        "peak_pressure": {
            "level": "High",
            "expected_peak_hour": "19:00",
            "affected_region": "Algiers",
            "expected_load_mw": 140,
            "recommended_action": "Battery discharge + demand response",
            "reason": "High evening demand with lower renewable availability",
        },
        "sustainability": {
            "renewable_share_pct": 42,
            "clean_energy_used_mwh": 270,
            "co2_avoided_tons": 12.4,
            "curtailment_risk": "Low",
            "renewable_utilization_pct": 88,
        },
    }
