export type DataSourceMode =
  | "Simulated"
  | "CSV Demo Dataset"
  | "Manual Demo Input"
  | "Weather API Ready"
  | "SCADA Pilot Ready"
  | "Smart Meter Pilot Ready"
  | "Renewable Plant API Ready"
  | "Market Simulation Only";

export interface DataProvenance {
  sourceMode: DataSourceMode;
  sourceName: string;
  isRealTime: boolean;
  isRealData: boolean;
  lastUpdated: string;
  confidence: number;
  notes: string;
}

export const demoLastUpdated = "2026-06-10T03:45:00.000Z";

export const demoRegionalProvenance: DataProvenance = {
  sourceMode: "CSV Demo Dataset",
  sourceName: "NV TEAM simulated regional energy dataset",
  isRealTime: false,
  isRealData: false,
  lastUpdated: demoLastUpdated,
  confidence: 0.88,
  notes: "Demo data used to validate forecasting, regional comparison, and dashboard workflow. Not real Sonelgaz data.",
};

export const marketSimulationProvenance: DataProvenance = {
  sourceMode: "Market Simulation Only",
  sourceName: "NV TEAM national market scenario model",
  isRealTime: false,
  isRealData: false,
  lastUpdated: demoLastUpdated,
  confidence: 0.74,
  notes: "Future-ready market intelligence simulation. Not live trading, bidding, or market control.",
};

export function formatConfidence(provenance: DataProvenance) {
  return `${Math.round(provenance.confidence * 100)}%`;
}
