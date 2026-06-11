"use client";
import { Leaf } from "lucide-react";
import { demoSustainabilityKpis } from "@/lib/dashboard/demoOperationalData";

export function SustainabilityKpis() {
  const rows = [
    ["Renewable Share", `${demoSustainabilityKpis.renewableSharePct}%`],
    ["Clean Energy Used", `${demoSustainabilityKpis.cleanEnergyUsedMWh} MWh`],
    ["CO2 Avoided Today", `${demoSustainabilityKpis.co2AvoidedTons} tons`],
    ["Curtailment Risk", demoSustainabilityKpis.curtailmentRisk],
    ["Renewable Utilization", `${demoSustainabilityKpis.renewableUtilizationPct}%`],
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Carbon & Sustainability</h2>
        <Leaf className="text-grid-500" size={20} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[var(--bg-secondary)] p-3">
            <p className="text-[11px] text-[var(--text-secondary)]">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">Demo estimates for sustainability storytelling; not certified emissions accounting.</p>
    </section>
  );
}
