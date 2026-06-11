"use client";
import { Leaf, Sun, Wind } from "lucide-react";

export function RenewableIntegrationPanel() {
  const metrics = [
    { label: "Renewable Share Today", value: "42%" },
    { label: "Solar", value: "28.7 MW" },
    { label: "Wind", value: "19.5 MW" },
    { label: "Forecast Deviation", value: "6.2%" },
    { label: "CO2 Avoided", value: "41 t" },
    { label: "Curtailment Risk", value: "Low" },
  ];

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Renewable Integration</h2>
          <p className="text-xs text-[var(--text-secondary)]">Weather-linked renewable potential and dispatch readiness.</p>
        </div>
        <div className="flex gap-2 text-grid-500"><Sun size={18} /><Wind size={18} /><Leaf size={18} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg bg-[var(--bg-secondary)] p-3">
            <p className="text-[11px] text-[var(--text-secondary)]">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--text-secondary)]">Solar production is expected to decrease by 18% due to cloudy conditions and evening ramp-down.</p>
    </section>
  );
}
