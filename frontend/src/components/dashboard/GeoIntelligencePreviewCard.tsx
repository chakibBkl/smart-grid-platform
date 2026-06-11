"use client";
import Link from "next/link";
import { Map } from "lucide-react";
import { getRegionalSummary } from "@/lib/dashboard/demoRegionalEnergyData";

export function GeoIntelligencePreviewCard() {
  const summary = getRegionalSummary();
  const rows = [
    ["Highest solar potential", summary.highestSolar.name],
    ["Highest demand pressure", summary.highestDemand.name],
    ["Highest risk region", summary.highestRisk.name],
    ["Best hybrid region", summary.bestHybrid.name],
    ["Remote resilience scenario", "Tamanrasset"],
  ];

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Geo Intelligence</h2>
        <Map className="text-grid-500" size={19} />
      </div>
      <div className="mt-4 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-xs">
            <span className="text-[var(--text-secondary)]">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <Link href="/geo-intelligence" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Open Geo Intelligence</Link>
    </section>
  );
}
