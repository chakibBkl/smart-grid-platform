"use client";
import type { RegionalEnergyType } from "@/lib/dashboard/demoRegionalEnergyData";

export const typeStyles: Record<RegionalEnergyType, { label: string; color: string; className: string }> = {
  renewable_potential: { label: "Renewable potential", color: "#22c55e", className: "bg-green-500" },
  conventional_energy_hub: { label: "Conventional hub", color: "#3b82f6", className: "bg-blue-500" },
  industrial_demand: { label: "Industrial demand", color: "#f97316", className: "bg-orange-500" },
  high_demand: { label: "High demand / risk", color: "#ef4444", className: "bg-red-500" },
  hybrid_production_demand: { label: "Hybrid production + demand", color: "#a855f7", className: "bg-purple-500" },
  remote_energy_need: { label: "Remote energy need", color: "#eab308", className: "bg-yellow-500" },
};

export function RegionalLegend() {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="text-sm font-semibold">Regional Legend</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(typeStyles).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className={`h-3 w-3 rounded-full ${style.className}`} />
            <span>{style.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
