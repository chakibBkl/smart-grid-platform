"use client";
import type { RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";
import { demoRegionalProvenance, formatConfidence } from "@/lib/reality/dataProvenance";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";

export function RegionalPerformanceCard({ region }: { region: RegionalEnergyData }) {
  const rows = [
    ["Current load", `${region.currentLoadMW} MW`],
    ["Solar potential", `${region.solarPotential}%`],
    ["Wind potential", `${region.windPotential}%`],
    ["Industrial demand", `${region.industrialDemandScore}%`],
    ["Demand pressure", `${region.demandPressure}%`],
    ["Grid health", `${region.gridHealth}%`],
    ["Battery SOC", `${region.batterySOC}%`],
    ["Temperature", `${region.temperature} C`],
    ["Cloud cover", `${region.cloudCover}%`],
    ["Wind speed", `${region.windSpeed} km/h`],
    ["Humidity", `${region.humidity}%`],
    ["Data quality", `${region.dataQuality}%`],
  ];

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{region.name}</h2>
          <p className="text-xs text-[var(--text-secondary)]">{region.wilaya}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${riskBadgeClass(region.riskLevel)}`}>{region.riskLevel}</span>
      </div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{region.energyRole}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs">
        <p><strong>Data Mode:</strong> Simulated Regional Dataset</p>
        <p><strong>Confidence:</strong> {formatConfidence(demoRegionalProvenance)}</p>
        <p><strong>Last Updated:</strong> {new Date(demoRegionalProvenance.lastUpdated).toLocaleString()}</p>
        <p><strong>Source:</strong> NV TEAM demo regional energy model</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[var(--bg-secondary)] p-2">
            <p className="text-[11px] text-[var(--text-secondary)]">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-grid-500/20 bg-grid-500/10 p-3">
        <p className="text-xs font-semibold text-grid-500">Best strategy</p>
        <p className="mt-1 text-sm">{region.bestEnergyStrategy}</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{region.recommendation}</p>
      </div>
      <TraceabilityDetails metric="regionalComparison" />
    </section>
  );
}
