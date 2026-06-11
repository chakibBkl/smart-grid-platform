import type { DataSourceMode } from "./dataProvenance";

export type MetricKey =
  | "currentLoadMW"
  | "solarMW"
  | "windMW"
  | "solarPotential"
  | "windPotential"
  | "batterySOC"
  | "gridHealthScore"
  | "renewableShare"
  | "dataQuality"
  | "riskLevel"
  | "forecastAccuracyMAPE"
  | "reserveMargin"
  | "demandPressure"
  | "industrialDemandScore"
  | "temperature"
  | "cloudCover"
  | "windSpeed"
  | "humidity"
  | "CO2Avoided"
  | "curtailmentRisk"
  | "forecastConfidence"
  | "peakPressure"
  | "marketIntelligence"
  | "regionalComparison"
  | "energyBalance";

export interface MetricDefinition {
  label: string;
  unit: string;
  description: string;
  source: string;
  sourceMode: DataSourceMode;
  calculation: string;
  usedIn: string[];
}

export const dataDictionary: Record<MetricKey, MetricDefinition> = {
  currentLoadMW: { label: "Current Load", unit: "MW", description: "Estimated electrical demand for the selected scope.", source: "Simulated regional dataset or pilot-ready smart meter/SCADA connector", sourceMode: "CSV Demo Dataset", calculation: "Regional demo load; national value is the sum of regional loads.", usedIn: ["Dashboard KPI", "Energy Balance", "Risk Detection"] },
  solarMW: { label: "Solar Power", unit: "MW", description: "Estimated available solar contribution.", source: "Simulated renewable model or renewable plant API ready connector", sourceMode: "Renewable Plant API Ready", calculation: "Load multiplied by solar potential and weather adjustment in demo mode.", usedIn: ["Energy Balance", "Renewables", "Forecasting"] },
  windMW: { label: "Wind Power", unit: "MW", description: "Estimated available wind contribution.", source: "Simulated renewable model or renewable plant API ready connector", sourceMode: "Renewable Plant API Ready", calculation: "Load multiplied by wind potential and wind-speed adjustment in demo mode.", usedIn: ["Energy Balance", "Renewables", "Forecasting"] },
  solarPotential: { label: "Solar Potential", unit: "%", description: "Relative regional solar suitability in the demo model.", source: "NV TEAM simulated regional energy dataset", sourceMode: "CSV Demo Dataset", calculation: "Assigned from regional climate profile and cloud cover assumptions.", usedIn: ["Geo Intelligence", "Renewables", "Regional Strategy"] },
  windPotential: { label: "Wind Potential", unit: "%", description: "Relative regional wind suitability in the demo model.", source: "NV TEAM simulated regional energy dataset", sourceMode: "CSV Demo Dataset", calculation: "Assigned from regional coastal/desert wind assumptions.", usedIn: ["Geo Intelligence", "Renewables", "Regional Strategy"] },
  batterySOC: { label: "Battery State of Charge", unit: "%", description: "Estimated available battery storage level.", source: "Simulated battery system or pilot-ready battery API", sourceMode: "Manual Demo Input", calculation: "Demo battery value linked to regional demand pressure and risk.", usedIn: ["Energy Balance", "Action Center", "Decision Explanation"] },
  gridHealthScore: { label: "Grid Health Score", unit: "%", description: "Operational stability score for a selected scope.", source: "Demo operational model", sourceMode: "CSV Demo Dataset", calculation: "Starts at 100 and decreases based on demand pressure, reserve margin, data quality, battery SOC, risk, and weather impact.", usedIn: ["Dashboard KPI", "Risk Detection", "Reports"] },
  renewableShare: { label: "Renewable Share", unit: "%", description: "Estimated renewable contribution or regional renewable suitability.", source: "Simulated renewable model", sourceMode: "CSV Demo Dataset", calculation: "National demo value averages solar and wind potential across all regions.", usedIn: ["National Dashboard", "Renewables", "Reports"] },
  dataQuality: { label: "Data Quality", unit: "%", description: "Completeness and reliability indicator for the demo data source.", source: "Demo data validation model", sourceMode: "CSV Demo Dataset", calculation: "Regional quality score; national value is average of regional scores.", usedIn: ["Forecast Confidence", "Reports", "Decision Explanation"] },
  riskLevel: { label: "Risk Level", unit: "level", description: "Categorical operational risk label.", source: "Demo risk model", sourceMode: "CSV Demo Dataset", calculation: "Derived from demand pressure, reserve margin, battery SOC, forecast confidence, data quality, weather impact, and asset health.", usedIn: ["Risk Alerts", "Geo Intelligence", "Action Center"] },
  forecastAccuracyMAPE: { label: "Forecast Accuracy MAPE", unit: "%", description: "Mean absolute percentage error target or demo forecast error.", source: "Simulated forecast model", sourceMode: "CSV Demo Dataset", calculation: "Lower value when data quality and forecast confidence are higher.", usedIn: ["Forecasting", "Decision Explanation"] },
  reserveMargin: { label: "Reserve Margin", unit: "%", description: "Supply available above demand.", source: "Demo energy balance model", sourceMode: "CSV Demo Dataset", calculation: "((totalSupplyMW - totalDemandMW) / totalDemandMW) * 100.", usedIn: ["Energy Balance", "Risk Detection"] },
  demandPressure: { label: "Demand Pressure", unit: "%", description: "Relative stress caused by local demand.", source: "NV TEAM simulated regional energy dataset", sourceMode: "CSV Demo Dataset", calculation: "Regional demand score from load, industrial demand, and urban profile.", usedIn: ["Regional Dashboard", "Geo Intelligence", "Risk Detection"] },
  industrialDemandScore: { label: "Industrial Demand Score", unit: "%", description: "Relative industrial demand intensity.", source: "NV TEAM simulated regional energy dataset", sourceMode: "CSV Demo Dataset", calculation: "Demo score based on oil, gas, port, petrochemical, and industrial corridor assumptions.", usedIn: ["Geo Intelligence", "Regional Comparison"] },
  temperature: { label: "Temperature", unit: "C", description: "Weather scenario temperature.", source: "Demo weather profile or weather API ready connector", sourceMode: "Weather API Ready", calculation: "Regional weather assumption used for heat-load impact.", usedIn: ["Weather Impact", "Forecasting"] },
  cloudCover: { label: "Cloud Cover", unit: "%", description: "Cloud cover scenario for solar output.", source: "Demo weather profile or weather API ready connector", sourceMode: "Weather API Ready", calculation: "Reduces solar availability in regional weather logic.", usedIn: ["Weather Impact", "Renewables"] },
  windSpeed: { label: "Wind Speed", unit: "km/h", description: "Wind speed scenario for wind output.", source: "Demo weather profile or weather API ready connector", sourceMode: "Weather API Ready", calculation: "Adjusts wind availability and forecast confidence.", usedIn: ["Weather Impact", "Renewables"] },
  humidity: { label: "Humidity", unit: "%", description: "Regional humidity scenario.", source: "Demo weather profile or weather API ready connector", sourceMode: "Weather API Ready", calculation: "Displayed as contextual weather data.", usedIn: ["Geo Intelligence", "Weather Impact"] },
  CO2Avoided: { label: "CO2 Avoided", unit: "tCO2", description: "Estimated emissions avoided through renewable contribution.", source: "Demo sustainability model", sourceMode: "CSV Demo Dataset", calculation: "Estimated from renewable utilization assumptions; not a certified emissions report.", usedIn: ["Renewables", "Reports"] },
  curtailmentRisk: { label: "Curtailment Risk", unit: "%", description: "Estimated risk of renewable generation not being used.", source: "Demo renewable operations model", sourceMode: "CSV Demo Dataset", calculation: "Increases with high renewable potential, weak demand absorption, and low storage.", usedIn: ["Renewables", "Optimization"] },
  forecastConfidence: { label: "Forecast Confidence", unit: "%", description: "Confidence in forecast output.", source: "Simulated forecast model", sourceMode: "CSV Demo Dataset", calculation: "Driven by data quality, risk level, weather volatility, and local asset conditions.", usedIn: ["Forecasting", "Decision Explanation"] },
  peakPressure: { label: "Peak Pressure", unit: "level", description: "Expected operational pressure during peak demand.", source: "Demo demand model", sourceMode: "CSV Demo Dataset", calculation: "Increases with demand pressure, low reserve margin, low battery SOC, and high heat load.", usedIn: ["Dashboard", "Action Center", "Decision Explanation"] },
  marketIntelligence: { label: "Market Intelligence", unit: "simulation", description: "Future-ready national strategic market simulation.", source: "NV TEAM national market scenario model", sourceMode: "Market Simulation Only", calculation: "Scenario prices and sentiment are simulated; no real trading or bidding is active.", usedIn: ["Market Intelligence"] },
  regionalComparison: { label: "Regional Comparison", unit: "score", description: "Decision-support comparison between regions.", source: "NV TEAM simulated regional energy dataset", sourceMode: "CSV Demo Dataset", calculation: "Compares solar, wind, industrial demand, demand pressure, battery SOC, data quality, and risk.", usedIn: ["Geo Intelligence"] },
  energyBalance: { label: "Energy Balance", unit: "MW", description: "Demand and supply balance for the selected scope.", source: "Demo energy balance model", sourceMode: "CSV Demo Dataset", calculation: "totalSupplyMW = solarMW + windMW + batteryMW + conventionalMW; reserve margin follows from supply and demand.", usedIn: ["Dashboard", "Optimization", "Decision Explanation"] },
};

export function getMetricDefinition(key: MetricKey) {
  return dataDictionary[key];
}
