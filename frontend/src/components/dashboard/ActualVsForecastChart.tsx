"use client";
import { AreaChart } from "@/components/charts/AreaChart";
import type { ForecastPoint } from "@/lib/dashboard/demoDashboardData";

export function ActualVsForecastChart({ data, mape }: { data: ForecastPoint[]; mape: number }) {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Actual vs Forecast</h2>
          <p className="text-xs text-[var(--text-secondary)]">LSTM Load Forecast v1 with confidence range.</p>
        </div>
        <div className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">MAPE {mape}%</div>
      </div>
      <AreaChart
        data={data}
        height={280}
        lines={[
          { dataKey: "actualLoad", color: "#22c55e", name: "Actual Load" },
          { dataKey: "forecastLoad", color: "#3b82f6", name: "Forecast Load" },
          { dataKey: "confidenceHigh", color: "#94a3b8", name: "Confidence High" },
          { dataKey: "confidenceLow", color: "#64748b", name: "Confidence Low" },
        ]}
      />
    </section>
  );
}
