import { riskWeight, type RegionalEnergyData, type RegionalRiskLevel } from "@/lib/dashboard/demoRegionalEnergyData";

export type BalanceStatus = "Deficit" | "Tight" | "Balanced" | "Surplus";

export interface EnergyBalance {
  totalDemandMW: number;
  solarMW: number;
  windMW: number;
  batteryMW: number;
  conventionalMW: number;
  totalSupplyMW: number;
  reserveMarginPercent: number;
  status: BalanceStatus;
}

export function calculateRegionalEnergyBalance(region: RegionalEnergyData): EnergyBalance {
  const totalDemandMW = region.currentLoadMW;
  const solarWeatherFactor = Math.max(0.45, 1 - region.cloudCover / 100);
  const windWeatherFactor = Math.max(0.55, Math.min(1.18, region.windSpeed / 26));
  const solarMW = round(totalDemandMW * (region.solarPotential / 100) * 0.28 * solarWeatherFactor);
  const windMW = round(totalDemandMW * (region.windPotential / 100) * 0.18 * windWeatherFactor);
  const batteryMW = round(totalDemandMW * (region.batterySOC / 100) * 0.12);
  const conventionalMW = round(totalDemandMW * (0.72 + region.industrialDemandScore / 1000));
  const totalSupplyMW = round(solarMW + windMW + batteryMW + conventionalMW);
  const reserveMarginPercent = round(((totalSupplyMW - totalDemandMW) / totalDemandMW) * 100);
  return { totalDemandMW, solarMW, windMW, batteryMW, conventionalMW, totalSupplyMW, reserveMarginPercent, status: getBalanceStatus(reserveMarginPercent) };
}

export function calculateNationalEnergyBalance(regions: RegionalEnergyData[]): EnergyBalance {
  const regional = regions.map(calculateRegionalEnergyBalance);
  const totalDemandMW = round(regional.reduce((sum, item) => sum + item.totalDemandMW, 0));
  const solarMW = round(regional.reduce((sum, item) => sum + item.solarMW, 0));
  const windMW = round(regional.reduce((sum, item) => sum + item.windMW, 0));
  const batteryMW = round(regional.reduce((sum, item) => sum + item.batteryMW, 0));
  const conventionalMW = round(regional.reduce((sum, item) => sum + item.conventionalMW, 0));
  const totalSupplyMW = round(solarMW + windMW + batteryMW + conventionalMW);
  const reserveMarginPercent = round(((totalSupplyMW - totalDemandMW) / totalDemandMW) * 100);
  return { totalDemandMW, solarMW, windMW, batteryMW, conventionalMW, totalSupplyMW, reserveMarginPercent, status: getBalanceStatus(reserveMarginPercent) };
}

export function calculateGridHealth(region: RegionalEnergyData) {
  const balance = calculateRegionalEnergyBalance(region);
  const weatherPenalty = region.temperature > 40 ? 8 : region.cloudCover > 25 ? 5 : 2;
  const score = 100
    - Math.max(0, region.demandPressure - 60) * 0.35
    - Math.max(0, 55 - region.batterySOC) * 0.22
    - Math.max(0, 90 - region.dataQuality) * 0.25
    - riskWeight(region.riskLevel) * 2.5
    - Math.max(0, 8 - balance.reserveMarginPercent) * 0.45
    - weatherPenalty;
  return clamp(Math.round(score), 0, 100);
}

export function calculateRiskLevel(region: RegionalEnergyData): RegionalRiskLevel {
  const balance = calculateRegionalEnergyBalance(region);
  const forecastConfidence = Math.max(65, region.dataQuality - (region.cloudCover > 25 ? 6 : 2));
  const score =
    region.demandPressure * 0.28
    + Math.max(0, 20 - balance.reserveMarginPercent) * 1.1
    + Math.max(0, 60 - region.batterySOC) * 0.22
    + Math.max(0, 90 - forecastConfidence) * 0.35
    + Math.max(0, 90 - region.dataQuality) * 0.3
    + (region.temperature > 40 || region.cloudCover > 25 ? 12 : 4)
    + Math.max(0, 82 - region.gridHealth) * 0.25;
  if (score >= 82) return "Critical";
  if (score >= 68) return "High";
  if (score >= 52) return "Medium-High";
  if (score >= 35) return "Medium";
  return "Low";
}

export function getRecommendationFromLogic(region: RegionalEnergyData) {
  const balance = calculateRegionalEnergyBalance(region);
  if (region.dataQuality < 85) return "Validate data source before approving operational action.";
  if (region.demandPressure >= 85 && region.batterySOC >= 45) return "Prepare battery discharge during peak hours.";
  if (balance.reserveMarginPercent < 5) return "Keep reserve support ready because the reserve margin is tight.";
  if (region.type === "high_demand") return "Activate demand response and peak shaving scenario.";
  if (region.solarPotential >= 90) return "Prioritize solar forecasting and storage planning.";
  return region.recommendation;
}

export function getBalanceStatus(reserveMargin: number): BalanceStatus {
  if (reserveMargin < 0) return "Deficit";
  if (reserveMargin <= 5) return "Tight";
  if (reserveMargin <= 15) return "Balanced";
  return "Surplus";
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
