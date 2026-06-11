export type OperationalPriority = "Critical" | "High" | "Medium" | "Low";
export type OperationalStatus = "Pending" | "Approved" | "Rejected" | "Resolved";
export type AssetStatus = "Normal" | "Warning" | "Critical" | "Offline";
export type SourceStatus = "Active" | "Simulated" | "Ready" | "Pilot Ready" | "Offline";

export interface OperationalAction {
  id: string;
  priority: OperationalPriority;
  title: string;
  description: string;
  recommendedAction: string;
  deadline: string;
  status: OperationalStatus;
  expectedImpact: string;
}

export interface EnergyBalance {
  demandMW: number;
  solarMW: number;
  windMW: number;
  batteryMW: number;
  conventionalSupportMW: number;
}

export interface DemoAnomaly {
  id: string;
  type: string;
  severity: OperationalPriority;
  region: string;
  description: string;
  possibleCause: string;
  recommendedAction: string;
  timestamp: string;
}

export interface ForecastConfidence {
  load: number;
  solar: number;
  wind: number;
  price: number;
  mape: number;
  rmseMW: number;
  dataQuality: number;
  model: string;
  lastUpdated: string;
}

export interface AssetHealth {
  name: string;
  value: string;
  percent?: number;
  status: AssetStatus;
}

export interface DataSourceStatus {
  name: string;
  status: SourceStatus;
  lastUpdate: string;
  dataQuality: number;
}

export interface WeatherImpact {
  impact: "Low" | "Medium" | "High";
  solarImpactPct: number;
  windImpactPct: number;
  heatLoadImpactPct: number;
  mostAffectedRegion: string;
  recommendedAction: string;
}

export interface PeakPressure {
  level: "Low" | "Medium" | "High" | "Critical";
  expectedPeakHour: string;
  affectedRegion: string;
  expectedLoadMW: number;
  recommendedAction: string;
  reason: string;
}

export interface SustainabilityKpis {
  renewableSharePct: number;
  cleanEnergyUsedMWh: number;
  co2AvoidedTons: number;
  curtailmentRisk: "Low" | "Medium" | "High";
  renewableUtilizationPct: number;
}

export const demoActions: OperationalAction[] = [
  {
    id: "evening-peak-pressure",
    priority: "High",
    title: "Evening peak pressure expected",
    description: "Demand is forecast to rise while solar contribution falls after sunset.",
    recommendedAction: "Discharge battery from 18:00 to 21:00",
    deadline: "18:00",
    status: "Pending",
    expectedImpact: "Reduce peak pressure by 12%",
  },
  {
    id: "adrar-solar-drop",
    priority: "Medium",
    title: "Solar drop expected in Adrar",
    description: "Renewable forecast shows lower solar availability before the evening ramp.",
    recommendedAction: "Increase reserve margin before evening peak",
    deadline: "16:30",
    status: "Pending",
    expectedImpact: "Improve grid stability by 5%",
  },
  {
    id: "arzew-industrial-demand",
    priority: "High",
    title: "Industrial demand pressure in Arzew",
    description: "Petrochemical demand and coastal wind variability create a tighter reserve window.",
    recommendedAction: "Prepare demand response with hybrid solar-wind dispatch",
    deadline: "17:15",
    status: "Pending",
    expectedImpact: "Protect 8% reserve margin",
  },
];

export const demoEnergyBalance: EnergyBalance = {
  demandMW: 520,
  solarMW: 180,
  windMW: 90,
  batteryMW: 40,
  conventionalSupportMW: 225,
};

export const demoAnomalies: DemoAnomaly[] = [
  {
    id: "algiers-load-spike",
    type: "Load anomaly",
    severity: "High",
    region: "Algiers",
    description: "Unusual load spike detected in Algiers.",
    possibleCause: "Evening consumption peak and high temperature.",
    recommendedAction: "Activate peak shaving scenario.",
    timestamp: "17:45",
  },
  {
    id: "biskra-solar-deviation",
    type: "Solar anomaly",
    severity: "Medium",
    region: "Biskra",
    description: "Solar production is lower than expected.",
    possibleCause: "Cloud cover deviation versus forecast.",
    recommendedAction: "Increase battery reserve.",
    timestamp: "16:20",
  },
  {
    id: "tamanrasset-battery-reserve",
    type: "Battery anomaly",
    severity: "Medium",
    region: "Tamanrasset",
    description: "Battery SOC is below the remote resilience threshold.",
    possibleCause: "Sustained local demand and limited reserve charging.",
    recommendedAction: "Hold non-critical discharge until peak window.",
    timestamp: "Now",
  },
];

export const demoForecastConfidence: ForecastConfidence = {
  load: 91,
  solar: 87,
  wind: 82,
  price: 76,
  mape: 4.8,
  rmseMW: 2.1,
  dataQuality: 93,
  model: "LSTM Load Forecast v1",
  lastUpdated: "2026-06-10 03:38",
};

export const demoAssetHealth: AssetHealth[] = [
  { name: "Battery Health", value: "84%", percent: 84, status: "Normal" },
  { name: "Solar Plant", value: "Normal", percent: 91, status: "Normal" },
  { name: "Wind Site", value: "Warning", percent: 72, status: "Warning" },
  { name: "Transformer Load", value: "78%", percent: 78, status: "Normal" },
  { name: "Line Congestion", value: "Medium", percent: 62, status: "Warning" },
  { name: "Sensor Network", value: "Active", percent: 93, status: "Normal" },
];

export const demoDataSources: DataSourceStatus[] = [
  { name: "CSV Demo Data", status: "Active", lastUpdate: "03:38", dataQuality: 95 },
  { name: "Weather Feed", status: "Simulated", lastUpdate: "03:35", dataQuality: 88 },
  { name: "Smart Meter Connector", status: "Ready", lastUpdate: "03:31", dataQuality: 91 },
  { name: "SCADA Connector", status: "Pilot Ready", lastUpdate: "03:28", dataQuality: 86 },
  { name: "Battery API", status: "Simulated", lastUpdate: "03:38", dataQuality: 93 },
  { name: "Renewable Plant API", status: "Ready", lastUpdate: "03:34", dataQuality: 90 },
  { name: "Market Data", status: "Simulated", lastUpdate: "03:20", dataQuality: 84 },
];

export const demoWeatherImpact: WeatherImpact = {
  impact: "Medium",
  solarImpactPct: -18,
  windImpactPct: 9,
  heatLoadImpactPct: 12,
  mostAffectedRegion: "Hassi Messaoud",
  recommendedAction: "Prepare battery support during evening peak.",
};

export const demoPeakPressure: PeakPressure = {
  level: "High",
  expectedPeakHour: "19:00",
  affectedRegion: "Algiers",
  expectedLoadMW: 140,
  recommendedAction: "Battery discharge + demand response",
  reason: "High evening demand with lower renewable availability.",
};

export const demoSustainabilityKpis: SustainabilityKpis = {
  renewableSharePct: 42,
  cleanEnergyUsedMWh: 270,
  co2AvoidedTons: 12.4,
  curtailmentRisk: "Low",
  renewableUtilizationPct: 88,
};
