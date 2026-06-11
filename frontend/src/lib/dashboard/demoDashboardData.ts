import type { RiskAlert } from "./riskCalculations";

export interface DashboardKpis {
  currentLoadMW: number;
  solarMW: number;
  windMW: number;
  batterySOC: number;
  renewableShare: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  forecastAccuracyMape: number;
  dataQuality: number;
}

export interface ForecastPoint {
  timestamp: string;
  actualLoad: number;
  forecastLoad: number;
  confidenceLow: number;
  confidenceHigh: number;
  forecastError: number;
}

export const dashboardKpis: DashboardKpis = {
  currentLoadMW: 86.4,
  solarMW: 28.7,
  windMW: 19.5,
  batterySOC: 54,
  renewableShare: 42,
  riskLevel: "Medium",
  forecastAccuracyMape: 4.8,
  dataQuality: 93,
};

export const recommendation = {
  action: "Discharge battery from 18:00 to 21:00",
  reason: "Load is expected to increase while solar production decreases during the evening peak.",
  expectedImpact: ["Reduce peak pressure by 12%", "Save 320,000 DZD", "Improve stability by 6%"],
  expectedSavingDZD: 320000,
  risk: "Medium",
  confidence: 88,
};

export const riskAlerts: RiskAlert[] = [
  { id: "evening-peak", severity: "high", title: "High evening peak expected", description: "Demand is forecast to rise between 18:00 and 21:00.", recommendedAction: "Prepare battery discharge and peak shaving.", timestamp: "18:00" },
  { id: "solar-drop", severity: "medium", title: "Solar generation expected to drop", description: "Cloud cover and sunset reduce solar contribution by 18%.", recommendedAction: "Shift dispatch toward wind and stored energy.", timestamp: "17:30" },
  { id: "battery-soc", severity: "medium", title: "Battery SOC below ideal reserve", description: "Battery reserve is usable but below the preferred demo threshold.", recommendedAction: "Keep 20% reserve for contingency support.", timestamp: "Now" },
  { id: "forecast-deviation", severity: "low", title: "Renewable deviation from forecast", description: "Wind generation is 4% above forecast while solar is 6% below.", recommendedAction: "Monitor deviation before approving new dispatch.", timestamp: "Now" },
];

export const loadSeries = Array.from({ length: 24 }, (_, index) => {
  const hour = index;
  const base = 72 + Math.sin((hour - 7) / 24 * Math.PI * 2) * 13;
  const eveningPeak = hour >= 18 && hour <= 21 ? 16 : 0;
  return {
    timestamp: new Date(2026, 5, 10, hour).toISOString(),
    load_mw: Math.round((base + eveningPeak) * 10) / 10,
    solar_mw: Math.max(0, Math.round((34 * Math.sin((hour - 6) / 12 * Math.PI)) * 10) / 10),
    wind_mw: Math.round((18 + Math.sin(hour / 24 * Math.PI * 2) * 5 + (hour % 3)) * 10) / 10,
  };
});

export const forecastSeries: ForecastPoint[] = Array.from({ length: 24 }, (_, index) => {
  const actual = loadSeries[index]?.load_mw ?? 70;
  const forecast = actual + (index % 4 - 1.5) * 1.8;
  return {
    timestamp: new Date(2026, 5, 10, index).toISOString(),
    actualLoad: Math.round(actual * 10) / 10,
    forecastLoad: Math.round(forecast * 10) / 10,
    confidenceLow: Math.round((forecast - 4.5) * 10) / 10,
    confidenceHigh: Math.round((forecast + 4.5) * 10) / 10,
    forecastError: Math.round(Math.abs(actual - forecast) * 10) / 10,
  };
});

export const dataQuality = {
  score: 93,
  missingDataPct: 1.8,
  sensorDelaySeconds: 34,
  lastUpdate: "2026-06-10 03:38",
  source: "Simulated + API-ready fallback",
};
