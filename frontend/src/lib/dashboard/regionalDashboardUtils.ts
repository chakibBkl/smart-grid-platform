import type { AssetHealth, ForecastConfidence, OperationalAction, WeatherImpact } from "./demoOperationalData";
import type { RegionalEnergyData } from "./demoRegionalEnergyData";

export function getRegionalRiskSummary(region: RegionalEnergyData) {
  return `${region.name} shows ${region.riskLevel.toLowerCase()} risk with ${region.demandPressure}% demand pressure, ${region.gridHealth}% grid health, and ${region.batterySOC}% battery SOC.`;
}

export function getRegionalWeatherImpact(region: RegionalEnergyData): WeatherImpact {
  const solarImpactPct = region.cloudCover > 20 ? -18 : region.temperature > 40 ? -10 : -5;
  const windImpactPct = region.windSpeed > 25 ? 11 : region.windSpeed > 18 ? 5 : -4;
  return {
    impact: region.temperature > 40 || region.cloudCover > 25 ? "High" : region.temperature > 33 ? "Medium" : "Low",
    solarImpactPct,
    windImpactPct,
    heatLoadImpactPct: region.temperature > 38 ? 12 : 6,
    mostAffectedRegion: region.name,
    recommendedAction: region.recommendation,
  };
}

export function getRegionalRecommendation(region: RegionalEnergyData) {
  return `${region.name}: ${region.recommendation} This is decision-support only and requires operator approval.`;
}

export function getRegionalAssetHealth(region: RegionalEnergyData): AssetHealth[] {
  return [
    { name: "Regional Battery", value: `${region.batterySOC}%`, percent: region.batterySOC, status: region.batterySOC < 45 ? "Warning" : "Normal" },
    { name: "Solar Availability", value: `${region.solarPotential}%`, percent: region.solarPotential, status: region.cloudCover > 25 ? "Warning" : "Normal" },
    { name: "Wind Availability", value: `${region.windPotential}%`, percent: region.windPotential, status: region.windSpeed < 16 && region.windPotential > 60 ? "Warning" : "Normal" },
    { name: "Sensor Quality", value: `${region.dataQuality}%`, percent: region.dataQuality, status: region.dataQuality < 85 ? "Warning" : "Normal" },
  ];
}

export function getRegionalActionItems(region: RegionalEnergyData): OperationalAction[] {
  const priority = region.riskLevel === "High" || region.riskLevel === "Critical" ? "High" : region.riskLevel === "Medium-High" ? "High" : "Medium";
  return [
    {
      id: `${region.id}-peak-support`,
      priority,
      title: `${region.name} operational review`,
      description: getRegionalRiskSummary(region),
      recommendedAction: region.bestEnergyStrategy,
      deadline: "18:00",
      status: "Pending",
      expectedImpact: "Improve local stability and preserve reserve margin",
    },
  ];
}

export function getRegionalForecastConfidence(region: RegionalEnergyData): ForecastConfidence {
  const base = Math.max(70, Math.min(96, region.dataQuality - (region.riskLevel === "High" ? 7 : 2)));
  return {
    load: base,
    solar: Math.max(65, base - Math.round(region.cloudCover / 5)),
    wind: Math.max(65, base - Math.max(0, 22 - region.windSpeed)),
    price: 0,
    mape: Math.round((100 - base) / 3 * 10) / 10,
    rmseMW: Math.round(region.currentLoadMW * 0.035 * 10) / 10,
    dataQuality: region.dataQuality,
    model: `Regional Forecast Model - ${region.name}`,
    lastUpdated: "2026-06-10 03:38",
  };
}
