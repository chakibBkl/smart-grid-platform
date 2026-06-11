"use client";
import { useMemo, useState } from "react";
import type { RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskWeight } from "@/lib/dashboard/demoRegionalEnergyData";

export function RegionComparisonPanel({ regions }: { regions: RegionalEnergyData[] }) {
  const [regionAId, setRegionAId] = useState("hassi-messaoud");
  const [regionBId, setRegionBId] = useState("arzew");
  const regionA = regions.find((region) => region.id === regionAId) || regions[0];
  const regionB = regions.find((region) => region.id === regionBId) || regions[1];
  const recommendation = useMemo(() => compareRecommendation(regionA, regionB), [regionA, regionB]);

  const rows = [
    ["Solar Potential", `${regionA.solarPotential}%`, `${regionB.solarPotential}%`, regionA.solarPotential > regionB.solarPotential ? regionA.name : regionB.name],
    ["Wind Potential", `${regionA.windPotential}%`, `${regionB.windPotential}%`, regionA.windPotential > regionB.windPotential ? regionA.name : regionB.name],
    ["Current Load", `${regionA.currentLoadMW} MW`, `${regionB.currentLoadMW} MW`, regionA.currentLoadMW > regionB.currentLoadMW ? regionA.name : regionB.name],
    ["Industrial Demand", `${regionA.industrialDemandScore}%`, `${regionB.industrialDemandScore}%`, regionA.industrialDemandScore > regionB.industrialDemandScore ? regionA.name : regionB.name],
    ["Demand Pressure", `${regionA.demandPressure}%`, `${regionB.demandPressure}%`, regionA.demandPressure > regionB.demandPressure ? regionA.name : regionB.name],
    ["Grid Health", `${regionA.gridHealth}%`, `${regionB.gridHealth}%`, regionA.gridHealth > regionB.gridHealth ? regionA.name : regionB.name],
    ["Battery SOC", `${regionA.batterySOC}%`, `${regionB.batterySOC}%`, regionA.batterySOC > regionB.batterySOC ? regionA.name : regionB.name],
    ["Temperature", `${regionA.temperature} C`, `${regionB.temperature} C`, regionA.temperature > regionB.temperature ? regionA.name : regionB.name],
    ["Cloud Cover", `${regionA.cloudCover}%`, `${regionB.cloudCover}%`, regionA.cloudCover < regionB.cloudCover ? regionA.name : regionB.name],
    ["Data Quality", `${regionA.dataQuality}%`, `${regionB.dataQuality}%`, regionA.dataQuality > regionB.dataQuality ? regionA.name : regionB.name],
    ["Risk Level", regionA.riskLevel, regionB.riskLevel, riskWeight(regionA.riskLevel) > riskWeight(regionB.riskLevel) ? regionA.name : regionB.name],
    ["Best Strategy", regionA.bestEnergyStrategy, regionB.bestEnergyStrategy, "Location specific"],
  ];

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Compare Two Regions</h2>
          <p className="text-xs text-[var(--text-secondary)]">The platform does not only monitor energy values. It compares regional performance and recommends the best operational strategy for each location while keeping final decisions under human control.</p>
        </div>
        <div className="flex gap-2">
          <RegionSelect value={regionAId} onChange={setRegionAId} regions={regions} />
          <RegionSelect value={regionBId} onChange={setRegionBId} regions={regions} />
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="text-[var(--text-secondary)]">
            <tr>
              <th className="py-2">Metric</th>
              <th className="py-2">{regionA.name}</th>
              <th className="py-2">{regionB.name}</th>
              <th className="py-2">Better / Higher</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([metric, a, b, better]) => (
              <tr key={metric} className="border-t border-[var(--border)]">
                <td className="py-2 font-medium">{metric}</td>
                <td className="py-2 text-[var(--text-secondary)]">{a}</td>
                <td className="py-2 text-[var(--text-secondary)]">{b}</td>
                <td className="py-2 text-grid-500">{better}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 rounded-lg border border-grid-500/20 bg-grid-500/10 p-3 text-sm text-[var(--text-secondary)]">{recommendation}</p>
    </section>
  );
}

function RegionSelect({ value, onChange, regions }: { value: string; onChange: (value: string) => void; regions: RegionalEnergyData[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs">
      {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
    </select>
  );
}

function compareRecommendation(regionA: RegionalEnergyData, regionB: RegionalEnergyData) {
  return `${regionA.name} performs better for solar-based optimization when its solar potential and cloud cover are stronger than the comparison region. ${regionB.name} may be stronger for hybrid industrial energy management when it combines demand, wind potential, and industrial activity. The recommended strategy is to prioritize ${regionA.bestEnergyStrategy.toLowerCase()} in ${regionA.name} and ${regionB.bestEnergyStrategy.toLowerCase()} in ${regionB.name}.`;
}
