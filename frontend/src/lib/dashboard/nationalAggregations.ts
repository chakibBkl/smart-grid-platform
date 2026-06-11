import { riskWeight, type RegionalEnergyData } from "./demoRegionalEnergyData";

export function getTotalLoad(regions: RegionalEnergyData[]) {
  return regions.reduce((sum, region) => sum + region.currentLoadMW, 0);
}

export function getAverageGridHealth(regions: RegionalEnergyData[]) {
  return average(regions.map((region) => region.gridHealth));
}

export function getHighestRiskRegion(regions: RegionalEnergyData[]) {
  return [...regions].sort((a, b) => riskWeight(b.riskLevel) - riskWeight(a.riskLevel) || a.gridHealth - b.gridHealth)[0];
}

export function getHighestDemandRegion(regions: RegionalEnergyData[]) {
  return [...regions].sort((a, b) => b.demandPressure - a.demandPressure)[0];
}

export function getHighestSolarRegion(regions: RegionalEnergyData[]) {
  return [...regions].sort((a, b) => b.solarPotential - a.solarPotential)[0];
}

export function getBestHybridRegion(regions: RegionalEnergyData[]) {
  return [...regions]
    .filter((region) => region.type === "hybrid_production_demand")
    .sort((a, b) => b.solarPotential + b.windPotential + b.industrialDemandScore - (a.solarPotential + a.windPotential + a.industrialDemandScore))[0];
}

export function getAverageDataQuality(regions: RegionalEnergyData[]) {
  return average(regions.map((region) => region.dataQuality));
}

export function getNationalRenewableShare(regions: RegionalEnergyData[]) {
  const renewableScore = regions.reduce((sum, region) => sum + region.solarPotential + region.windPotential, 0);
  return Math.round(renewableScore / (regions.length * 2));
}

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
