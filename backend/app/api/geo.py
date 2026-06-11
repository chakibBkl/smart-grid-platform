from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/geo", tags=["Geo Intelligence"])

REGIONS = [
    {"id": "hassi-messaoud", "name": "Hassi Messaoud", "wilaya": "Ouargla", "lat": 31.68, "lng": 6.07, "type": "hybrid_production_demand", "energyRole": "Oil production hub + industrial demand + strong solar potential", "currentLoadMW": 92, "solarPotential": 95, "windPotential": 38, "industrialDemandScore": 88, "demandPressure": 82, "gridHealth": 86, "riskLevel": "Medium", "batterySOC": 58, "temperature": 43, "cloudCover": 6, "windSpeed": 18, "humidity": 16, "dataQuality": 92, "bestEnergyStrategy": "Solar forecasting + industrial load optimization", "recommendation": "Prioritize solar forecasting and prepare battery support during evening industrial peak."},
    {"id": "arzew", "name": "Arzew", "wilaya": "Oran", "lat": 35.85, "lng": -0.32, "type": "hybrid_production_demand", "energyRole": "Gas/LNG hub + petrochemical demand + coastal wind potential", "currentLoadMW": 118, "solarPotential": 70, "windPotential": 74, "industrialDemandScore": 96, "demandPressure": 91, "gridHealth": 81, "riskLevel": "Medium-High", "batterySOC": 46, "temperature": 31, "cloudCover": 22, "windSpeed": 31, "humidity": 62, "dataQuality": 89, "bestEnergyStrategy": "Hybrid solar-wind strategy + demand response", "recommendation": "Use hybrid solar-wind forecasting and activate demand response during industrial peak hours."},
    {"id": "hassi-rmel", "name": "Hassi R'Mel", "wilaya": "Laghouat", "lat": 32.93, "lng": 3.27, "type": "conventional_energy_hub", "energyRole": "Gas hub + hybrid solar-gas reference zone", "currentLoadMW": 64, "solarPotential": 90, "windPotential": 42, "industrialDemandScore": 72, "demandPressure": 58, "gridHealth": 89, "riskLevel": "Low", "batterySOC": 67, "temperature": 39, "cloudCover": 9, "windSpeed": 20, "humidity": 21, "dataQuality": 94, "bestEnergyStrategy": "Hybrid gas-solar balancing", "recommendation": "Use this region as a reference model for hybrid gas-solar balancing and storage planning."},
    {"id": "skikda", "name": "Skikda", "wilaya": "Skikda", "lat": 36.87, "lng": 6.91, "type": "hybrid_production_demand", "energyRole": "Industrial coastal demand + gas/LNG infrastructure", "currentLoadMW": 104, "solarPotential": 66, "windPotential": 69, "industrialDemandScore": 90, "demandPressure": 86, "gridHealth": 79, "riskLevel": "Medium-High", "batterySOC": 49, "temperature": 29, "cloudCover": 28, "windSpeed": 28, "humidity": 65, "dataQuality": 88, "bestEnergyStrategy": "Coastal wind support + industrial peak monitoring", "recommendation": "Monitor industrial demand peaks and use coastal wind forecasting for additional support."},
    {"id": "adrar", "name": "Adrar", "wilaya": "Adrar", "lat": 27.87, "lng": -0.29, "type": "renewable_potential", "energyRole": "Very high solar potential zone", "currentLoadMW": 41, "solarPotential": 97, "windPotential": 44, "industrialDemandScore": 38, "demandPressure": 44, "gridHealth": 91, "riskLevel": "Low", "batterySOC": 72, "temperature": 44, "cloudCover": 4, "windSpeed": 17, "humidity": 12, "dataQuality": 95, "bestEnergyStrategy": "Large-scale solar + storage planning", "recommendation": "Ideal region for solar forecasting, storage planning, and microgrid scenarios."},
    {"id": "ghardaia", "name": "Ghardaia", "wilaya": "Ghardaia", "lat": 32.49, "lng": 3.67, "type": "renewable_potential", "energyRole": "Solar potential + regional balancing zone", "currentLoadMW": 52, "solarPotential": 91, "windPotential": 40, "industrialDemandScore": 48, "demandPressure": 51, "gridHealth": 87, "riskLevel": "Low", "batterySOC": 65, "temperature": 40, "cloudCover": 8, "windSpeed": 16, "humidity": 18, "dataQuality": 91, "bestEnergyStrategy": "Solar forecasting + regional storage", "recommendation": "Use solar forecasting and battery scheduling to support regional demand."},
    {"id": "biskra", "name": "Biskra", "wilaya": "Biskra", "lat": 34.85, "lng": 5.73, "type": "renewable_potential", "energyRole": "Solar potential + agricultural and urban demand", "currentLoadMW": 69, "solarPotential": 88, "windPotential": 43, "industrialDemandScore": 55, "demandPressure": 64, "gridHealth": 84, "riskLevel": "Medium", "batterySOC": 57, "temperature": 41, "cloudCover": 10, "windSpeed": 15, "humidity": 20, "dataQuality": 90, "bestEnergyStrategy": "Solar support + demand forecasting", "recommendation": "Use solar production forecasting to support local demand and reduce evening peak pressure."},
    {"id": "algiers", "name": "Algiers", "wilaya": "Algiers", "lat": 36.75, "lng": 3.06, "type": "high_demand", "energyRole": "Major urban demand center", "currentLoadMW": 140, "solarPotential": 62, "windPotential": 48, "industrialDemandScore": 77, "demandPressure": 95, "gridHealth": 76, "riskLevel": "High", "batterySOC": 39, "temperature": 34, "cloudCover": 25, "windSpeed": 18, "humidity": 58, "dataQuality": 87, "bestEnergyStrategy": "Demand forecasting + peak shaving", "recommendation": "Apply demand forecasting, peak shaving, and demand response during evening consumption peaks."},
    {"id": "setif-bba", "name": "Setif / Bordj Bou Arreridj", "wilaya": "Setif / BBA", "lat": 36.19, "lng": 5.41, "type": "industrial_demand", "energyRole": "Industrial and urban demand corridor", "currentLoadMW": 88, "solarPotential": 72, "windPotential": 52, "industrialDemandScore": 84, "demandPressure": 78, "gridHealth": 83, "riskLevel": "Medium", "batterySOC": 55, "temperature": 32, "cloudCover": 18, "windSpeed": 21, "humidity": 35, "dataQuality": 90, "bestEnergyStrategy": "Industrial load forecasting + renewable support", "recommendation": "Use industrial load forecasting and compare efficiency with coastal and desert hubs."},
    {"id": "annaba", "name": "Annaba", "wilaya": "Annaba", "lat": 36.9, "lng": 7.77, "type": "industrial_demand", "energyRole": "Industrial demand + port activity", "currentLoadMW": 96, "solarPotential": 64, "windPotential": 63, "industrialDemandScore": 86, "demandPressure": 80, "gridHealth": 80, "riskLevel": "Medium-High", "batterySOC": 51, "temperature": 30, "cloudCover": 24, "windSpeed": 25, "humidity": 66, "dataQuality": 88, "bestEnergyStrategy": "Industrial demand response + coastal wind forecasting", "recommendation": "Use demand response and coastal wind forecasting to reduce industrial peak pressure."},
    {"id": "tamanrasset", "name": "Tamanrasset", "wilaya": "Tamanrasset", "lat": 22.79, "lng": 5.52, "type": "remote_energy_need", "energyRole": "Remote demand + strong solar potential", "currentLoadMW": 35, "solarPotential": 96, "windPotential": 46, "industrialDemandScore": 30, "demandPressure": 57, "gridHealth": 74, "riskLevel": "Medium", "batterySOC": 44, "temperature": 41, "cloudCover": 5, "windSpeed": 19, "humidity": 14, "dataQuality": 82, "bestEnergyStrategy": "Microgrid + solar storage", "recommendation": "Best for microgrid scenarios, solar storage, and remote-area energy resilience."},
    {"id": "bechar-tindouf", "name": "Bechar / Tindouf", "wilaya": "Bechar / Tindouf", "lat": 31.63, "lng": -2.2, "type": "remote_energy_need", "energyRole": "Remote demand + future mining and solar potential", "currentLoadMW": 44, "solarPotential": 93, "windPotential": 49, "industrialDemandScore": 45, "demandPressure": 62, "gridHealth": 77, "riskLevel": "Medium", "batterySOC": 47, "temperature": 42, "cloudCover": 7, "windSpeed": 22, "humidity": 15, "dataQuality": 84, "bestEnergyStrategy": "Solar microgrid + future mining load planning", "recommendation": "Use solar microgrid planning and prepare future demand scenarios for mining and remote industrial activity."},
]


@router.get("/regions")
async def geo_regions():
    return {
        "regions": REGIONS,
        "summary": {
            "regions_monitored": len(REGIONS),
            "highest_solar_region": max(REGIONS, key=lambda region: region["solarPotential"])["name"],
            "highest_demand_region": max(REGIONS, key=lambda region: region["demandPressure"])["name"],
            "highest_risk_region": "Algiers",
            "best_hybrid_region": "Arzew",
        },
    }


@router.get("/compare")
async def compare_regions(region_a: str = Query("hassi-messaoud"), region_b: str = Query("arzew")):
    first = next((region for region in REGIONS if region["id"] == region_a), None)
    second = next((region for region in REGIONS if region["id"] == region_b), None)
    if not first or not second:
        raise HTTPException(status_code=404, detail="One or both regions were not found")

    return {
        "region_a": first,
        "region_b": second,
        "recommendation": (
            f"{first['name']} is strong for {first['bestEnergyStrategy'].lower()}. "
            f"{second['name']} is strong for {second['bestEnergyStrategy'].lower()}. "
            "Use the comparison to choose a human-approved operational strategy for each location."
        ),
    }
