"use client";
import { demoForecastConfidence } from "@/lib/dashboard/demoOperationalData";

export function ForecastConfidencePanel() {
  const rows = [
    ["Load Forecast Confidence", demoForecastConfidence.load],
    ["Solar Forecast Confidence", demoForecastConfidence.solar],
    ["Wind Forecast Confidence", demoForecastConfidence.wind],
    ["Price Simulation Confidence", demoForecastConfidence.price],
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <h2 className="text-sm font-semibold">Forecast Confidence</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs"><span className="text-[var(--text-secondary)]">{label}</span><span className="font-semibold">{value}%</span></div>
            <div className="h-2 rounded-full bg-[var(--bg-secondary)]"><div className="h-full rounded-full bg-grid-500" style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Metric label="MAPE" value={`${demoForecastConfidence.mape}%`} />
        <Metric label="RMSE" value={`${demoForecastConfidence.rmseMW} MW`} />
        <Metric label="Data Quality" value={`${demoForecastConfidence.dataQuality}%`} />
        <Metric label="Last Updated" value={demoForecastConfidence.lastUpdated} />
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">Model: {demoForecastConfidence.model}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--bg-secondary)] p-2"><p className="text-[11px] text-[var(--text-secondary)]">{label}</p><p className="font-semibold">{value}</p></div>;
}
