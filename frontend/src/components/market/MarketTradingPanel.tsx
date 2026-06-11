"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradingPanelProps {
  currentPrice: number;
  sentiment: string;
}

export function MarketTradingPanel({ currentPrice, sentiment }: TradingPanelProps) {
  const [scenarioAmount, setScenarioAmount] = useState(10);
  const [scenario, setScenario] = useState<{
    action: "import" | "reserve";
    value: number;
    operationalImpact: string;
    recommendation: string;
    timestamp: string;
  } | null>(null);

  const handleScenario = (action: "import" | "reserve") => {
    const amount = clampAmount(scenarioAmount);
    const value = amount * currentPrice;
    setScenarioAmount(amount);
    setScenario({
      action,
      value,
      operationalImpact: action === "import"
        ? `Import simulation adds ${amount} MWh of external supply to reduce regional pressure during the peak window.`
        : `Reserve simulation holds ${amount} MWh as protected capacity for contingency and evening peak support.`,
      recommendation: action === "import"
        ? "Use only after operator review, transmission availability check, and regulatory validation."
        : "Keep reserve locked unless grid health drops or peak demand exceeds forecast.",
      timestamp: new Date().toLocaleString(),
    });
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-4">Market Scenario Panel</h3>

      <div className="space-y-4">
        <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
          <p className="text-xs text-[var(--text-secondary)]">Scenario Price Index</p>
          <p className="text-2xl font-bold text-grid-500">{currentPrice.toFixed(2)}</p>
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Scenario Amount (MWh)</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setScenarioAmount((value) => Math.max(1, value - 5))} className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm">-</button>
            <input
              type="number"
              value={scenarioAmount}
              min={1}
              max={500}
              onChange={(e) => setScenarioAmount(clampAmount(Number(e.target.value) || 1))}
              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-center"
            />
            <button onClick={() => setScenarioAmount((value) => Math.min(500, value + 5))} className="px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm">+</button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleScenario("import")}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingUp size={16} />
            Simulate Import
          </button>
          <button
            onClick={() => handleScenario("reserve")}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingDown size={16} />
            Simulate Reserve
          </button>
        </div>

        {scenario && (
          <section className={`rounded-lg border p-3 text-xs ${scenario.action === "import" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{scenario.action === "import" ? "Import Scenario Ready" : "Reserve Scenario Ready"}</p>
                <p className="mt-1 text-[var(--text-secondary)]">{scenario.timestamp}</p>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 font-semibold">
                {scenarioAmount} MWh
              </span>
            </div>
            <p className="mt-3 text-[var(--text-secondary)]">{scenario.operationalImpact}</p>
            <p className="mt-2 font-semibold text-[var(--text-primary)]">Scenario value: {scenario.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="mt-2 text-[var(--text-secondary)]">{scenario.recommendation}</p>
            <p className="mt-2 rounded-md bg-[var(--bg-card)] p-2 font-semibold text-[var(--text-primary)]">Decision-support only. Human approval is required before operational execution.</p>
          </section>
        )}

        <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
          <span>Module status</span>
          <span className="font-semibold text-[var(--text-primary)]">{scenario ? "Scenario Simulated" : "Ready"}</span>
        </div>
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          <span>Scenario value</span>
          <span className="font-semibold text-[var(--text-primary)]">{(scenarioAmount * currentPrice).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function clampAmount(value: number) {
  return Math.min(500, Math.max(1, Math.round(value)));
}
