"use client";
import type { RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";

export function RegionalRecommendationBox({ region }: { region: RegionalEnergyData }) {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="text-sm font-semibold">AI Regional Recommendation</h2>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{explainRegion(region)}</p>
    </section>
  );
}

export function explainRegion(region: RegionalEnergyData) {
  if (region.id === "hassi-messaoud") {
    return "Hassi Messaoud is a strong candidate for solar-based optimization because solar potential is very high and industrial demand is significant. The recommended strategy is to combine solar forecasting with battery support during evening peak hours.";
  }
  if (region.id === "arzew") {
    return "Arzew is better suited for hybrid energy management because it combines high industrial demand with coastal wind potential. The system recommends demand response and hybrid solar-wind forecasting during industrial peak periods.";
  }
  if (region.id === "tamanrasset") {
    return "Tamanrasset is suitable for a remote microgrid scenario because it has high solar potential and a stronger need for resilient local energy supply.";
  }
  return `${region.name} should use ${region.bestEnergyStrategy.toLowerCase()} because its current demand pressure is ${region.demandPressure}% and grid health is ${region.gridHealth}%. ${region.recommendation}`;
}
