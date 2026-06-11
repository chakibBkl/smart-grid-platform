import type { CopilotMessage, ForecastResponse, MarketPrediction, OptimizationResult, UserResponse, TokenResponse, EnergyData } from "@/types";

interface RLActionResponse {
  action: string;
  battery_charge_rate: number;
  grid_buy_amount: number;
  grid_sell_amount: number;
  expected_reward: number;
  q_values: Record<string, number>;
}

interface RLPolicyResponse {
  policy_version: string;
  state_space: string[];
  action_space: string[];
  exploration_rate: number;
  total_training_episodes: number;
  average_reward: number;
  last_updated: string;
}

interface ConversationListItem {
  id: number;
  title: string;
  message_count: number;
  updated_at: string;
}

type EnergyDataResponse = EnergyData;

export interface MarketSentiment {
  current_sentiment: string;
  average_price: number;
  volatility: number;
  trading_volume_mwh: number;
  timestamp: string;
}

interface EnergySummary {
  [key: string]: {
    min: number;
    max: number;
    avg: number;
    current: number;
  };
}

const API_BASE = "/api/v1";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    register: (data: { username: string; email: string; password: string }) =>
      request<UserResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<UserResponse>("/auth/me"),
  },

  forecasting: {
    predict: (forecastType: string, horizonHours = 48) =>
      request<ForecastResponse>("/forecasting/predict", {
        method: "POST",
        body: JSON.stringify({ forecast_type: forecastType, horizon_hours: horizonHours }),
      }),
    history: (forecastType?: string) =>
      request<ForecastResponse[]>(`/forecasting/history${forecastType ? `?forecast_type=${forecastType}` : ""}`),
  },

  market: {
    predict: (horizonHours = 24) =>
      request<MarketPrediction>("/market/predict", {
        method: "POST",
        body: JSON.stringify({ horizon_hours: horizonHours }),
      }),
    sentiment: () => request<MarketSentiment>("/market/sentiment"),
  },

  optimization: {
    optimize: (data: { optimization_type: string; horizon_hours: number; initial_battery_soc: number; risk_tolerance: string }) =>
      request<OptimizationResult>("/optimization/optimize", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  rl: {
    action: (state: { load_mw: number; solar_mw: number; wind_mw: number; price_per_mwh: number; battery_soc: number }) =>
      request<RLActionResponse>("/rl/action", {
        method: "POST",
        body: JSON.stringify(state),
      }),
    policy: () => request<RLPolicyResponse>("/rl/policy"),
  },

  copilot: {
    chat: (message: string, conversationId?: string) =>
      request<CopilotMessage>("/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message, conversation_id: conversationId }),
      }),
    conversations: () => request<ConversationListItem[]>("/copilot/conversations"),
  },

  energy: {
    get: (type: string, hours = 24) => request<EnergyDataResponse[]>(`/energy/${type}?hours=${hours}`),
    summary: (type: string) => request<EnergySummary>(`/energy/${type}/summary`),
  },
};
