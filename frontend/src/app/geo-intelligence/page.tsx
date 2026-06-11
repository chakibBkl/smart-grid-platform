"use client";
import { useMemo, useState } from "react";
import { GeoIntelligenceMap } from "@/components/dashboard/geo/GeoIntelligenceMap";
import { RegionalLegend } from "@/components/dashboard/geo/RegionalLegend";
import { RegionalPerformanceCard } from "@/components/dashboard/geo/RegionalPerformanceCard";
import { RegionalRecommendationBox } from "@/components/dashboard/geo/RegionalRecommendationBox";
import { RegionComparisonPanel } from "@/components/dashboard/geo/RegionComparisonPanel";
import { WeatherLayerToggle, type WeatherLayer } from "@/components/dashboard/geo/WeatherLayerToggle";
import { DemoAssumptionsPanel } from "@/components/dashboard/reality/DemoAssumptionsPanel";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { demoRegionalEnergyData, getRegionalSummary } from "@/lib/dashboard/demoRegionalEnergyData";

export default function GeoIntelligencePage() {
  const [selectedId, setSelectedId] = useState("hassi-messaoud");
  const [layer, setLayer] = useState<WeatherLayer>("riskLevel");
  const selected = demoRegionalEnergyData.find((region) => region.id === selectedId) || demoRegionalEnergyData[0];
  const summary = useMemo(() => getRegionalSummary(demoRegionalEnergyData), []);

  const summaryCards = [
    ["Regions monitored", demoRegionalEnergyData.length.toString()],
    ["Highest solar potential", summary.highestSolar.name],
    ["Highest demand pressure", summary.highestDemand.name],
    ["Highest risk region", summary.highestRisk.name],
    ["Best hybrid region", summary.bestHybrid.name],
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Algeria Energy Geo Intelligence</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Weather, renewable potential, production hubs, demand zones, and regional risk comparison.</p>
            <p className="mt-2 max-w-5xl text-sm text-[var(--text-secondary)]">
              Geo Intelligence uses a simulated regional dataset to compare production zones, high-demand regions, renewable potential, and operational risk across Algeria. This is decision support, not a real dispatch order.
            </p>
          </div>
          <RealityModeBadge />
        </div>
      </header>

      <DemoAssumptionsPanel />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
            <p className="mt-2 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <GeoIntelligenceMap regions={demoRegionalEnergyData} selected={selected} layer={layer} onSelect={(region) => setSelectedId(region.id)} />
        <RegionalPerformanceCard region={selected} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <WeatherLayerToggle value={layer} onChange={setLayer} />
        <RegionalLegend />
      </div>

      <RegionComparisonPanel regions={demoRegionalEnergyData} />
      <TraceabilityDetails metric="regionalComparison" assumptions="Hassi Messaoud ranks strong for solar when solar potential is high and cloud cover is low. Arzew ranks strong for hybrid industrial strategy when wind potential and industrial demand are high in the demo model." />
      <RegionalRecommendationBox region={selected} />
    </div>
  );
}
