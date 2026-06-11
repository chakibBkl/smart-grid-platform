import { calculateRegionalEnergyBalance, calculateRiskLevel } from "./calculationRules";
import type { RegionalEnergyData, RegionalRiskLevel } from "@/lib/dashboard/demoRegionalEnergyData";

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
}

export function validateRegionData(region: RegionalEnergyData): ValidationResult {
  const warnings: string[] = [];
  if (region.currentLoadMW < 0) warnings.push(`${region.name}: current load cannot be negative.`);
  percent(region.solarPotential, "solar potential", warnings, region.name);
  percent(region.windPotential, "wind potential", warnings, region.name);
  percent(region.batterySOC, "battery SOC", warnings, region.name);
  percent(region.dataQuality, "data quality", warnings, region.name);
  percent(region.gridHealth, "grid health", warnings, region.name);
  percent(region.demandPressure, "demand pressure", warnings, region.name);
  percent(region.industrialDemandScore, "industrial demand", warnings, region.name);

  const calculatedRisk = calculateRiskLevel(region);
  if (!riskCompatible(region.riskLevel, calculatedRisk)) {
    warnings.push(`${region.name}: displayed risk ${region.riskLevel} differs from calculated risk ${calculatedRisk}; demo label must remain visible.`);
  }

  const balance = calculateRegionalEnergyBalance(region);
  if (balance.totalSupplyMW < 0 || balance.totalDemandMW < 0) warnings.push(`${region.name}: energy balance contains negative MW values.`);
  return { valid: warnings.length === 0, warnings };
}

export function validateRegions(regions: RegionalEnergyData[]): ValidationResult {
  const warnings = regions.flatMap((region) => validateRegionData(region).warnings);
  return { valid: warnings.length === 0, warnings };
}

function percent(value: number, label: string, warnings: string[], regionName: string) {
  if (value < 0 || value > 100) warnings.push(`${regionName}: ${label} must be between 0 and 100%.`);
}

function riskCompatible(displayed: RegionalRiskLevel, calculated: RegionalRiskLevel) {
  const order: RegionalRiskLevel[] = ["Low", "Medium", "Medium-High", "High", "Critical"];
  return Math.abs(order.indexOf(displayed) - order.indexOf(calculated)) <= 1;
}
