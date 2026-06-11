"use client";
import { demoDataSources } from "@/lib/dashboard/demoOperationalData";

export function DataSourcesStatus() {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <h2 className="text-sm font-semibold">Data Sources Status</h2>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">Demo, simulated, and pilot-ready connectors only. No real Sonelgaz data is claimed.</p>
      <div className="mt-4 space-y-2">
        {demoDataSources.map((source) => (
          <div key={source.name} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--bg-secondary)] p-2">
            <div>
              <p className="text-xs font-semibold">{source.name}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Last update {source.lastUpdate} - quality {source.dataQuality}%</p>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${sourceClass(source.status)}`}>{source.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function sourceClass(status: string) {
  if (status === "Offline") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (status === "Simulated") return "border-purple-500/30 bg-purple-500/10 text-purple-500";
  if (status === "Pilot Ready") return "border-blue-500/30 bg-blue-500/10 text-blue-500";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}
