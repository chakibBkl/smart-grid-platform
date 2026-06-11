export type GridHealthStatus = "Stable" | "Warning" | "Critical";

export interface GridHealthInput {
  loadMW: number;
  peakLoadMW: number;
  batterySOC: number;
  renewableForecastDropPct: number;
  dataQuality: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

export interface GridHealthResult {
  score: number;
  status: GridHealthStatus;
  reason: string;
}

export function calculateGridHealth(input: GridHealthInput): GridHealthResult {
  let score = 100;
  const reasons: string[] = [];
  const loadRatio = input.loadMW / input.peakLoadMW;

  if (loadRatio > 0.9) {
    score -= 12;
    reasons.push("peak load pressure is high");
  } else if (loadRatio > 0.78) {
    score -= 6;
    reasons.push("load is approaching peak range");
  }

  if (input.batterySOC < 35) {
    score -= 14;
    reasons.push("battery reserve is below recommended level");
  } else if (input.batterySOC < 55) {
    score -= 7;
    reasons.push("battery reserve is moderate");
  }

  if (input.renewableForecastDropPct > 25) {
    score -= 10;
    reasons.push("renewable output is forecast to drop sharply");
  } else if (input.renewableForecastDropPct > 12) {
    score -= 5;
    reasons.push("renewable output is expected to soften");
  }

  if (input.dataQuality < 85) {
    score -= 10;
    reasons.push("data quality needs operator attention");
  } else if (input.dataQuality < 93) {
    score -= 4;
    reasons.push("data quality is acceptable but not optimal");
  }

  if (input.riskLevel === "Critical") score -= 18;
  if (input.riskLevel === "High") score -= 12;
  if (input.riskLevel === "Medium") score -= 5;

  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const status: GridHealthStatus = boundedScore >= 85 ? "Stable" : boundedScore >= 68 ? "Warning" : "Critical";

  return {
    score: boundedScore,
    status,
    reason: reasons.length > 0 ? sentenceCase(reasons.slice(0, 2).join(" and ")) : "Grid indicators are within expected demo operating range",
  };
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
