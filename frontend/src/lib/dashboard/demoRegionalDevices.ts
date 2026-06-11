import { demoRegionalEnergyData, type RegionalEnergyData } from "./demoRegionalEnergyData";
import type { DeviceData, DeviceStatus, DeviceType } from "./deviceTypes";

const requiredRegionIds = new Set(["arzew", "hassi-messaoud", "adrar", "algiers"]);

export const demoRegionalDevices: DeviceData[] = demoRegionalEnergyData
  .filter((region) => requiredRegionIds.has(region.id))
  .flatMap((region) => buildDevicesForRegion(region));

export function getRegionalDevices(regionId: string) {
  const configured = demoRegionalDevices.filter((device) => device.regionId === regionId);
  if (configured.length > 0) return configured;
  const region = demoRegionalEnergyData.find((item) => item.id === regionId);
  return region ? buildDevicesForRegion(region) : [];
}

function buildDevicesForRegion(region: RegionalEnergyData): DeviceData[] {
  const now = "2026-06-10T07:38:00.000Z";
  const warning = region.riskLevel === "High" || region.riskLevel === "Medium-High";
  const batteryStatus: DeviceStatus = region.batterySOC < 42 ? "Critical" : region.batterySOC < 55 ? "Warning" : "Normal";
  const demandStatus: DeviceStatus = region.demandPressure > 90 ? "Critical" : region.demandPressure > 78 ? "Warning" : "Normal";
  return [
    device(region, "data_hub", "Data Hub / AI Node", "Normal", now, { x: 0, y: 0.35, z: 0 }, "NV TEAM regional AI processing node", {
      activePipelines: 6,
      forecastingJobs: 3,
      anomalyChecks: 8,
      processingLatencyMs: 180 + (100 - region.dataQuality) * 4,
      modelUsed: "LSTM/XGBoost demo ensemble",
    }, [], "Continue monitoring. AI node is processing regional data normally.", "The AI node collects device data, validates quality, runs forecasts, detects risks, and generates decision-support recommendations."),
    device(region, "smart_meter", "Smart Meter Cluster", region.dataQuality < 85 ? "Warning" : "Normal", now, { x: -3.4, y: 0.2, z: 0.2 }, "Smart meter pilot-ready connector", {
      measuredLoadMW: region.currentLoadMW,
      sampleCoveragePercent: region.dataQuality,
      feederCount: Math.max(4, Math.round(region.currentLoadMW / 18)),
      loadTrend: region.demandPressure > 75 ? "Increasing" : "Stable",
    }, region.dataQuality < 85 ? ["Meter coverage should be validated before action approval."] : [], "Use smart meter stream to confirm peak load before approving operational action.", "Smart meters estimate regional demand and feed the AI node with load and quality indicators."),
    device(region, "weather_station", "Weather Station", region.temperature > 40 || region.cloudCover > 25 ? "Warning" : "Normal", now, { x: -1.8, y: 0.2, z: -2.8 }, "Weather API ready demo feed", {
      temperatureC: region.temperature,
      cloudCoverPercent: region.cloudCover,
      windSpeedKmh: region.windSpeed,
      humidityPercent: region.humidity,
    }, region.temperature > 40 ? ["High temperature increases heat-load pressure."] : [], "Use weather impact when validating renewable forecasts.", "Weather data adjusts solar, wind, and demand pressure assumptions in the regional model."),
    device(region, "solar_plant", "Solar Plant", region.cloudCover > 25 ? "Warning" : "Normal", now, { x: -3.2, y: 0.15, z: -1.8 }, "Solar plant demo API", {
      currentProductionMW: round(region.currentLoadMW * region.solarPotential * 0.0028),
      forecastProductionMW: round(region.currentLoadMW * region.solarPotential * 0.0032),
      irradianceWm2: Math.max(520, 900 - region.cloudCover * 7),
      panelTemperatureC: region.temperature + 6,
      forecastDeviationPercent: region.cloudCover > 20 ? -11 : -4,
    }, region.cloudCover > 20 ? ["Solar output is below clear-sky expectation."] : [], "Prioritize solar forecasting and storage planning when solar deviation increases.", "Solar production is estimated from regional solar potential, cloud cover, and temperature assumptions."),
    device(region, "wind_site", "Wind Site", region.windSpeed < 15 && region.windPotential > 55 ? "Warning" : "Normal", now, { x: 3.1, y: 0.2, z: -1.6 }, "Wind site demo API", {
      currentProductionMW: round(region.currentLoadMW * region.windPotential * 0.0018),
      forecastProductionMW: round(region.currentLoadMW * region.windPotential * 0.002),
      windSpeedKmh: region.windSpeed,
      turbineAvailabilityPercent: region.windSpeed > 24 ? 94 : 88,
      efficiencyPercent: Math.min(90, 65 + Math.round(region.windSpeed / 2)),
    }, [], "Use wind generation as support during high demand hours when available.", "Wind site data helps the AI node estimate flexible renewable contribution."),
    device(region, "battery", "Battery Storage", batteryStatus, now, { x: -2.6, y: 0.25, z: 1.6 }, "Battery storage demo API", {
      socPercent: region.batterySOC,
      chargePowerMW: round(region.currentLoadMW * 0.07),
      dischargePowerMW: round(region.currentLoadMW * 0.11),
      healthPercent: Math.max(76, region.gridHealth - 2),
      availability: region.batterySOC < 35 ? "Limited" : "Available",
    }, region.batterySOC < 55 ? ["Battery reserve should be protected for evening peak."] : [], "Use battery support between 18:00 and 21:00 only after human approval.", "Battery SOC indicates whether storage can support expected peak pressure."),
    device(region, "transformer", "Primary Transformer", warning ? "Warning" : "Normal", now, { x: 2.4, y: 0.25, z: 1.2 }, "Transformer pilot-ready sensor feed", {
      loadingPercent: Math.min(98, region.demandPressure + 4),
      temperatureC: region.temperature + 12,
      healthPercent: region.gridHealth,
      protectionStatus: "Armed",
    }, warning ? ["Transformer loading should be monitored during peak window."] : [], "Monitor loading and avoid approving actions that increase transformer stress.", "Transformer telemetry contributes to grid health and peak pressure risk."),
    device(region, "sensor_network", "Sensor Network", region.dataQuality < 86 ? "Warning" : "Normal", now, { x: 1.2, y: 0.2, z: -3.1 }, "Regional sensor network demo feed", {
      activeSensors: Math.max(18, Math.round(region.dataQuality / 3)),
      packetQualityPercent: region.dataQuality,
      anomalyChecks: 8,
      offlineSensors: region.dataQuality < 86 ? 2 : 0,
    }, region.dataQuality < 86 ? ["Some sensors need validation before decision approval."] : [], "Validate sensor quality when confidence drops below threshold.", "Sensor network data supports anomaly detection and validates regional device readings."),
    device(region, "industrial_load_zone", "Industrial Load Zone", demandStatus, now, { x: 3.3, y: 0.25, z: 1.8 }, "Industrial demand demo feed", {
      currentDemandMW: region.currentLoadMW,
      peakForecastMW: round(region.currentLoadMW * (1 + region.demandPressure / 500)),
      industrialDemandScore: region.industrialDemandScore,
      loadTrend: region.demandPressure > 75 ? "Increasing" : "Stable",
      expectedPeakHour: "19:00",
    }, region.demandPressure > 80 ? ["Industrial load is expected to increase during evening peak."] : [], "Activate demand response scenario and prepare storage support if pressure rises.", "Industrial demand drives peak pressure and regional operational risk."),
  ];
}

function device(region: RegionalEnergyData, type: DeviceType, name: string, status: DeviceStatus, lastUpdate: string, position3D: { x: number; y: number; z: number }, dataSource: string, metrics: Record<string, string | number>, alerts: string[], recommendation: string, explanation: string): DeviceData {
  return {
    id: `${region.id}-${type}`,
    name,
    type,
    regionId: region.id,
    regionName: region.name,
    status,
    lastUpdate,
    dataSource,
    dataMode: type === "data_hub" ? "Simulated" : "Pilot Ready",
    dataQuality: region.dataQuality,
    confidence: Math.round((region.dataQuality / 100 - (status === "Warning" ? 0.03 : status === "Critical" ? 0.08 : 0)) * 100) / 100,
    position3D,
    metrics,
    alerts,
    recommendation,
    explanation,
  };
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
