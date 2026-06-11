"use client";
import { CloudSun } from "lucide-react";
import { demoWeatherImpact } from "@/lib/dashboard/demoOperationalData";

export function WeatherImpactIndex() {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Weather Impact Index</h2>
        <CloudSun className="text-yellow-500" size={20} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Weather Impact" value={demoWeatherImpact.impact} />
        <Metric label="Solar Impact" value={`${demoWeatherImpact.solarImpactPct}%`} />
        <Metric label="Wind Impact" value={`+${demoWeatherImpact.windImpactPct}%`} />
        <Metric label="Heat Impact on Load" value={`+${demoWeatherImpact.heatLoadImpactPct}%`} />
      </div>
      <p className="mt-4 text-xs text-[var(--text-secondary)]">Most affected region: <span className="font-semibold text-[var(--text-primary)]">{demoWeatherImpact.mostAffectedRegion}</span></p>
      <p className="mt-2 text-xs font-medium text-grid-500">{demoWeatherImpact.recommendedAction}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--bg-secondary)] p-3"><p className="text-[11px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}
