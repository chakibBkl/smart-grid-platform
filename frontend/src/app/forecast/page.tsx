"use client";
import { useState, useEffect } from "react";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { api } from "@/lib/api";
import type { ForecastResponse, KpiCard as KpiCardType } from "@/types";

function generateMockForecast(): ForecastResponse {
  const now = new Date();
  const timestamps: string[] = [];
  const values: number[] = [];
  for (let i = 0; i < 48; i++) {
    const t = new Date(now.getTime() + i * 3600000);
    timestamps.push(t.toISOString());
    const h = t.getHours();
    const v = 50 + 15 * Math.sin(2 * Math.PI * (h - 6) / 24) + 5 * Math.sin(2 * Math.PI * i / (24 * 7)) + (Math.random() - 0.5) * 4;
    values.push(Math.round(v * 100) / 100);
  }
  return {
    timestamps,
    values,
    upper_bounds: values.map((v) => Math.round((v + 8) * 100) / 100),
    lower_bounds: values.map((v) => Math.round((v - 8) * 100) / 100),
    confidence: 0.95,
    model_used: "ensemble_prophet_lstm_v2",
  };
}

export default function ForecastPage() {
  const [forecastType, setForecastType] = useState("load");
  const [forecast, setForecast] = useState<ForecastResponse>(generateMockForecast);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Try API, fallback to mock
    api.forecasting.predict(forecastType, 48)
      .then(setForecast)
      .catch(() => setForecast(generateMockForecast()))
      .finally(() => setLoading(false));
  }, [forecastType]);

  const chartData = forecast.timestamps.map((t, i) => ({
    timestamp: t,
    actual: forecast.values[i],
    upper: forecast.upper_bounds[i],
    lower: forecast.lower_bounds[i],
  }));

  const kpis: KpiCardType[] = [
    { title: "Peak Forecast", value: Math.max(...forecast.values).toFixed(1), unit: "MW", change: 4.2, changeType: "increase", icon: "zap" },
    { title: "Min Forecast", value: Math.min(...forecast.values).toFixed(1), unit: "MW", change: -2.1, changeType: "decrease", icon: "zap" },
    { title: "Avg Forecast", value: (forecast.values.reduce((a, b) => a + b, 0) / forecast.values.length).toFixed(1), unit: "MW", change: 1.3, changeType: "increase", icon: "zap" },
    { title: "Confidence", value: "95", unit: "%", change: 0, changeType: "increase", icon: "battery" },
  ];

  const dailyPattern = Array.from({ length: 24 }, (_, h) => ({
    name: `${h}:00`,
    load: 50 + 15 * Math.sin(2 * Math.PI * (h - 6) / 24) + (Math.random() - 0.5) * 3,
    solar: Math.max(0, 30 * Math.sin(2 * Math.PI * (h - 6) / 12) + (Math.random() - 0.5) * 4),
    wind: 20 + 5 * Math.sin(2 * Math.PI * h / 24) + (Math.random() - 0.5) * 6,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forecast Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI-powered energy demand and generation forecasts</p>
        </div>
        <div className="flex gap-2">
          {["load", "solar", "wind", "price"].map((type) => (
            <button
              key={type}
              onClick={() => setForecastType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                forecastType === type
                  ? "bg-grid-500 text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">48-Hour {forecastType} Forecast with Confidence Intervals</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-secondary)]">Loading...</div>
          ) : (
            <AreaChart
              data={chartData.slice(0, 48)}
              lines={[
                { dataKey: "actual", color: "#22c55e", name: "Forecast" },
                { dataKey: "upper", color: "#3b82f6", name: "Upper Bound" },
                { dataKey: "lower", color: "#f97316", name: "Lower Bound" },
              ]}
            />
          )}
          <div className="text-xs text-[var(--text-secondary)] mt-2">Model: {forecast.model_used} | Confidence: {(forecast.confidence * 100).toFixed(0)}%</div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">Typical Daily Pattern</h3>
          <BarChart
            data={dailyPattern}
            bars={[
              { dataKey: "load", color: "#22c55e", name: "Load" },
              { dataKey: "solar", color: "#eab308", name: "Solar" },
              { dataKey: "wind", color: "#3b82f6", name: "Wind" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
