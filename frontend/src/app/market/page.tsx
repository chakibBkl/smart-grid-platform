"use client";
import { useState, useEffect } from "react";
import { AreaChart } from "@/components/charts/AreaChart";
import { MarketTradingPanel } from "@/components/market/MarketTradingPanel";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DemoAssumptionsPanel } from "@/components/dashboard/reality/DemoAssumptionsPanel";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { api } from "@/lib/api";
import { getStoredScope, setNationalScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import { canAccessMarketIntelligence } from "@/lib/auth/permissions";
import type { MarketPrediction, KpiCard as KpiCardType } from "@/types";
import Link from "next/link";

function mockMarketPrediction(): MarketPrediction {
  const now = new Date();
  const timestamps: string[] = [];
  const prices: number[] = [];
  for (let i = 0; i < 96; i++) {
    const t = new Date(now.getTime() + i * 900000);
    timestamps.push(t.toISOString());
    const h = t.getHours();
    const deterministicAdjustment = ((i % 7) - 3) * 0.9;
    const p = 45 + 20 * Math.sin(2 * Math.PI * (h - 8) / 24) + deterministicAdjustment;
    prices.push(Math.round(p * 100) / 100);
  }
  return {
    timestamps,
    predicted_prices: prices,
    confidence_low: prices.map((p) => Math.round((p - 10) * 100) / 100),
    confidence_high: prices.map((p) => Math.round((p + 10) * 100) / 100),
    market_sentiment: "neutral",
    driving_factors: { renewable_penetration: "32.5% simulated", demand_forecast: "58.3 MW scenario", fuel_prices: "scenario input", weather_impact: "neutral demo", grid_congestion: "low simulated" },
  };
}

export default function MarketPage() {
  const [prediction, setPrediction] = useState<MarketPrediction>(mockMarketPrediction());
  const [sentiment, setSentiment] = useState({ current_sentiment: "neutral", average_price: 0, volatility: 0, trading_volume_mwh: 0 });
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      setBlocked(true);
      return;
    }
    if (!canAccessMarketIntelligence(session)) {
      setBlocked(true);
      return;
    }
    const { scope } = getStoredScope();
    if (scope === "regional") {
      setBlocked(true);
      return;
    }
    setLoading(true);
    api.market.predict(24)
      .then(setPrediction)
      .catch(() => setPrediction(mockMarketPrediction()))
      .finally(() => setLoading(false));

    api.market.sentiment()
      .then(setSentiment)
      .catch(() => {});
  }, []);

  if (blocked) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h1 className="text-2xl font-bold">Market Intelligence unavailable</h1>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)]">
          Market Intelligence is available only at the National Dashboard level because it requires aggregated multi-region data and strategic control permissions.
        </p>
        <Link
          href="/dashboard/national"
          onClick={() => setNationalScope()}
          className="mt-5 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white"
        >
          Go to National Dashboard
        </Link>
      </section>
    );
  }

  const chartData = prediction.timestamps.map((t, i) => ({
    timestamp: t,
    price: prediction.predicted_prices[i],
    low: prediction.confidence_low[i],
    high: prediction.confidence_high[i],
  }));

  const kpis: KpiCardType[] = [
    { title: "Current Price", value: prediction.predicted_prices[0]?.toFixed(2) || "0", unit: "$/MWh", change: 3.5, changeType: "increase", icon: "dollar" },
    { title: "Avg Price (24h)", value: (prediction.predicted_prices.reduce((a, b) => a + b, 0) / prediction.predicted_prices.length).toFixed(2), unit: "$/MWh", change: -1.2, changeType: "decrease", icon: "dollar" },
    { title: "Volatility", value: sentiment.volatility.toFixed(1), unit: "%", change: 8.3, changeType: "increase", icon: "zap" },
    { title: "Trading Volume", value: (sentiment.trading_volume_mwh / 1000).toFixed(1), unit: "GWh", change: 12.4, changeType: "increase", icon: "battery" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Market Simulation</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Future-ready national strategic module. No live electricity trading, bidding, or market control is active.</p>
          </div>
          <RealityModeBadge mode="future" />
        </div>
      </div>

      <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <h2 className="text-sm font-semibold text-yellow-600">Market Intelligence Limitation</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Market Intelligence is a national-level simulation module in this MVP. Advanced trading, bidding, and market optimization are future modules and require regulatory approval, market access, and validated data integration.
        </p>
      </section>

      <DemoAssumptionsPanel />

      <div className="flex items-center gap-3">
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
          sentiment.current_sentiment === "bullish" ? "bg-green-500/10 text-green-500" :
          sentiment.current_sentiment === "bearish" ? "bg-red-500/10 text-red-500" :
          "bg-yellow-500/10 text-yellow-500"
        }`}>
          {sentiment.current_sentiment}
        </div>
        <span className="text-sm text-[var(--text-secondary)]">Market sentiment</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">Price Forecast with Confidence Intervals</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-secondary)]">Loading...</div>
          ) : (
            <AreaChart
              data={chartData.slice(0, 48)}
              lines={[
                { dataKey: "price", color: "#22c55e", name: "Price" },
                { dataKey: "high", color: "#3b82f6", name: "Upper" },
                { dataKey: "low", color: "#f97316", name: "Lower" },
              ]}
            />
          )}
        </div>

        <MarketTradingPanel currentPrice={prediction.predicted_prices[0] || 45} sentiment={sentiment.current_sentiment} />
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-2">Driving Factors</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(prediction.driving_factors).map(([key, value]) => (
            <div key={key} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] capitalize">{key.replace(/_/g, " ")}</p>
              <p className="text-sm font-semibold mt-1">{String(value)}</p>
            </div>
          ))}
        </div>
        <TraceabilityDetails metric="marketIntelligence" />
      </div>
    </div>
  );
}
