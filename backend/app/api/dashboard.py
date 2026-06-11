from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

REGIONS = [
    {"id": "hassi-messaoud", "name": "Hassi Messaoud", "current_load_mw": 92, "solar_potential": 95, "wind_potential": 38, "grid_health": 86, "risk_level": "Medium", "demand_pressure": 82, "data_quality": 92},
    {"id": "arzew", "name": "Arzew", "current_load_mw": 118, "solar_potential": 70, "wind_potential": 74, "grid_health": 81, "risk_level": "Medium-High", "demand_pressure": 91, "data_quality": 89},
    {"id": "hassi-rmel", "name": "Hassi R'Mel", "current_load_mw": 64, "solar_potential": 90, "wind_potential": 42, "grid_health": 89, "risk_level": "Low", "demand_pressure": 58, "data_quality": 94},
    {"id": "skikda", "name": "Skikda", "current_load_mw": 104, "solar_potential": 66, "wind_potential": 69, "grid_health": 79, "risk_level": "Medium-High", "demand_pressure": 86, "data_quality": 88},
    {"id": "adrar", "name": "Adrar", "current_load_mw": 41, "solar_potential": 97, "wind_potential": 44, "grid_health": 91, "risk_level": "Low", "demand_pressure": 44, "data_quality": 95},
    {"id": "ghardaia", "name": "Ghardaia", "current_load_mw": 52, "solar_potential": 91, "wind_potential": 40, "grid_health": 87, "risk_level": "Low", "demand_pressure": 51, "data_quality": 91},
    {"id": "biskra", "name": "Biskra", "current_load_mw": 69, "solar_potential": 88, "wind_potential": 43, "grid_health": 84, "risk_level": "Medium", "demand_pressure": 64, "data_quality": 90},
    {"id": "algiers", "name": "Algiers", "current_load_mw": 140, "solar_potential": 62, "wind_potential": 48, "grid_health": 76, "risk_level": "High", "demand_pressure": 95, "data_quality": 87},
    {"id": "setif-bba", "name": "Setif / Bordj Bou Arreridj", "current_load_mw": 88, "solar_potential": 72, "wind_potential": 52, "grid_health": 83, "risk_level": "Medium", "demand_pressure": 78, "data_quality": 90},
    {"id": "annaba", "name": "Annaba", "current_load_mw": 96, "solar_potential": 64, "wind_potential": 63, "grid_health": 80, "risk_level": "Medium-High", "demand_pressure": 80, "data_quality": 88},
    {"id": "tamanrasset", "name": "Tamanrasset", "current_load_mw": 35, "solar_potential": 96, "wind_potential": 46, "grid_health": 74, "risk_level": "Medium", "demand_pressure": 57, "data_quality": 82},
    {"id": "bechar-tindouf", "name": "Bechar / Tindouf", "current_load_mw": 44, "solar_potential": 93, "wind_potential": 49, "grid_health": 77, "risk_level": "Medium", "demand_pressure": 62, "data_quality": 84},
]

RISK_WEIGHT = {"Low": 1, "Medium": 2, "Medium-High": 3, "High": 4, "Critical": 5}


@router.get("/summary")
async def dashboard_summary():
    return {
        "grid_health": {
            "score": 87,
            "status": "Warning",
            "reason": "Evening peak expected with lower solar generation",
        },
        "kpis": {
            "current_load_mw": 86.4,
            "solar_mw": 28.7,
            "wind_mw": 19.5,
            "battery_soc": 54,
            "renewable_share": 42,
            "risk_level": "Medium",
            "forecast_accuracy_mape": 4.8,
            "data_quality": 93,
        },
        "recommendation": {
            "action": "Discharge battery from 18:00 to 21:00",
            "reason": "High load expected while solar production decreases",
            "expected_saving_dzd": 320000,
            "confidence": 0.88,
            "risk": "Medium",
        },
        "alerts": [
            {
                "severity": "high",
                "title": "High evening peak expected",
                "description": "Demand is forecast to rise between 18:00 and 21:00.",
                "recommended_action": "Prepare battery discharge and peak shaving.",
                "timestamp": "18:00",
            }
        ],
    }


@router.get("/national-summary")
async def national_summary():
    highest_risk = sorted(REGIONS, key=lambda item: (RISK_WEIGHT[item["risk_level"]], -item["grid_health"]), reverse=True)[0]
    highest_demand = max(REGIONS, key=lambda item: item["demand_pressure"])
    highest_solar = max(REGIONS, key=lambda item: item["solar_potential"])
    best_hybrid = max(REGIONS, key=lambda item: item["solar_potential"] + item["wind_potential"])
    return {
        "scope": "national",
        "regions_monitored": len(REGIONS),
        "total_load_mw": sum(item["current_load_mw"] for item in REGIONS),
        "average_grid_health": round(sum(item["grid_health"] for item in REGIONS) / len(REGIONS)),
        "highest_risk_region": highest_risk["name"],
        "highest_demand_region": highest_demand["name"],
        "highest_solar_region": highest_solar["name"],
        "best_hybrid_region": best_hybrid["name"],
        "market_intelligence_enabled": True,
    }


@router.get("/regions/{region_id}/summary")
async def regional_summary(region_id: str):
    region = next((item for item in REGIONS if item["id"] == region_id), None)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    return {
        "scope": "regional",
        "region_id": region["id"],
        "region_name": region["name"],
        "market_intelligence_enabled": False,
        "current_load_mw": region["current_load_mw"],
        "solar_potential": region["solar_potential"],
        "wind_potential": region["wind_potential"],
        "grid_health": region["grid_health"],
        "risk_level": region["risk_level"],
    }


@router.get("/scope")
async def dashboard_scope():
    return {
        "available_scopes": ["national", "regional"],
        "roles_ready_for_future_permissions": ["National Admin", "Regional Operator", "Analyst", "Viewer"],
        "market_intelligence": "national_only",
    }
