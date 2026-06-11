import { calculateGridHealth } from "./calculateGridHealth";

export interface WhatIfInputs {
  solarDropPct: number;
  demandIncreasePct: number;
  batterySOC: number;
  windDropPct: number;
  peakHour: number;
}

export interface WhatIfResult {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  recommendedAction: string;
  estimatedCostImpactDZD: number;
  gridHealth: number;
}

export function simulateWhatIf(input: WhatIfInputs): WhatIfResult {
  const pressure = input.solarDropPct * 0.35 + input.demandIncreasePct * 0.55 + Math.max(0, 45 - input.batterySOC) * 0.5 + input.windDropPct * 0.2;
  const riskLevel = pressure > 48 ? "Critical" : pressure > 32 ? "High" : pressure > 18 ? "Medium" : "Low";
  const health = calculateGridHealth({
    loadMW: 78 + input.demandIncreasePct,
    peakLoadMW: 110,
    batterySOC: input.batterySOC,
    renewableForecastDropPct: Math.max(input.solarDropPct, input.windDropPct),
    dataQuality: 93,
    riskLevel,
  });

  const action =
    riskLevel === "Critical"
      ? "Activate demand response, discharge battery, and delay non-critical loads"
      : riskLevel === "High"
        ? "Discharge battery and apply peak shaving during the selected hour"
        : riskLevel === "Medium"
          ? "Prepare battery support and monitor renewable deviation"
          : "Keep normal dispatch with renewable forecast monitoring";

  return {
    riskLevel,
    recommendedAction: action,
    estimatedCostImpactDZD: Math.round(120000 + pressure * 9500),
    gridHealth: health.score,
  };
}
