export interface EnergyData {
  timestamp: string;
  load_mw: number;
  solar_mw: number;
  wind_mw: number;
  price_per_mwh: number;
  battery_soc: number;
}

export interface LoadData {
  timestamp: string;
  load_mw: number;
  industrial_load_mw: number;
  commercial_load_mw: number;
  residential_load_mw: number;
  temperature_c: number;
}

export interface SolarData {
  timestamp: string;
  solar_generation_mw: number;
  solar_irradiance_wm2: number;
  cloud_cover_pct: number;
  temperature_c: number;
}

export interface WindData {
  timestamp: string;
  wind_generation_mw: number;
  wind_speed_ms: number;
  temperature_c: number;
}

export interface MarketData {
  timestamp: string;
  price_per_mwh: number;
  load_mw: number;
  solar_generation_mw: number;
  wind_generation_mw: number;
  net_load_mw: number;
}

export interface BatteryData {
  timestamp: string;
  state_of_charge_mwh: number;
  soc_percentage: number;
  load_mw: number;
  solar_generation_mw: number;
  wind_generation_mw: number;
  market_price_per_mwh: number;
}

export interface ForecastResponse {
  timestamps: string[];
  values: number[];
  upper_bounds: number[];
  lower_bounds: number[];
  confidence: number;
  model_used: string;
}

export interface MarketPrediction {
  timestamps: string[];
  predicted_prices: number[];
  confidence_low: number[];
  confidence_high: number[];
  market_sentiment: string;
  driving_factors: Record<string, string>;
}

export interface OptimizationResult {
  recommended_actions: Action[];
  expected_savings: number;
  battery_schedule: Action[];
  trading_schedule: Action[];
  risk_score: number;
}

export interface Action {
  hour: number;
  timestamp: string;
  action: string;
  expected_price: number;
  soc_after: number;
}

export interface CopilotMessage {
  reply: string;
  conversation_id: string;
  sources: string[];
  confidence: number;
}

export interface KpiCard {
  title: string;
  value: string;
  unit: string;
  change: number;
  changeType: "increase" | "decrease";
  icon: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}
