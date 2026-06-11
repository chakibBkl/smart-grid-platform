"use client";
import { useState } from "react";
import type { RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskWeight } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";
import { typeStyles } from "./RegionalLegend";
import type { WeatherLayer } from "./WeatherLayerToggle";

interface GeoIntelligenceMapProps {
  regions: RegionalEnergyData[];
  selected: RegionalEnergyData;
  layer: WeatherLayer;
  onSelect: (region: RegionalEnergyData) => void;
}

export function GeoIntelligenceMap({ regions, selected, layer, onSelect }: GeoIntelligenceMapProps) {
  const [mapMode, setMapMode] = useState<"terrain" | "satellite">("terrain");
  const mapUrl =
    mapMode === "satellite"
      ? "https://maps.google.com/maps?hl=en&q=Algeria&t=k&z=5&output=embed"
      : "https://maps.google.com/maps?hl=en&q=Algeria&t=p&z=5&output=embed";

  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Google Map Algeria Energy Intelligence</h2>
          <p className="text-xs text-[var(--text-secondary)]">Google Maps background with NV TEAM operational markers over Algerian energy regions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
            <button
              onClick={() => setMapMode("terrain")}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${mapMode === "terrain" ? "bg-grid-500 text-white" : "text-[var(--text-secondary)]"}`}
            >
              Terrain
            </button>
            <button
              onClick={() => setMapMode("satellite")}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${mapMode === "satellite" ? "bg-grid-500 text-white" : "text-[var(--text-secondary)]"}`}
            >
              Satellite
            </button>
          </div>
          <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">{layerLabel(layer)}</span>
        </div>
      </div>

      <div className="relative mt-4 h-[440px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
        <iframe
          key={mapMode}
          title={`Google ${mapMode} map of Algeria`}
          src={mapUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/10" />
        <div className="absolute left-3 top-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]/95 px-3 py-2 text-xs shadow-sm">
          <p className="font-semibold">Google Maps layer</p>
          <p className="text-[var(--text-secondary)]">Internet required. NV TEAM markers are overlaid.</p>
        </div>

        {regions.map((region) => {
          const { x, y } = projectRegion(region);
          const isSelected = region.id === selected.id;
          const size = 14 + highlightValue(region, layer) * 0.08;
          return (
            <button
              key={region.id}
              onClick={() => onSelect(region)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 ${typeStyles[region.type].className} ${isSelected ? "ring-4 ring-grid-500/35" : ""}`}
              style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
              title={`${region.name} - ${region.riskLevel}`}
            >
              <span className="sr-only">{region.name}</span>
            </button>
          );
        })}
        <div className="absolute bottom-3 left-3 right-3 grid gap-2 md:grid-cols-3">
          {[selected].map((region) => (
            <div key={region.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]/95 p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{region.name}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(region.riskLevel)}`}>{region.riskLevel}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{region.energyRole}</p>
              <p className="mt-2 text-xs font-semibold text-grid-500">Grid health {region.gridHealth}%</p>
              <p className="mt-3 rounded-lg bg-grid-500/10 px-3 py-2 text-xs font-semibold text-grid-500">
                Regional dashboard requires its own regional login
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function highlightValue(region: RegionalEnergyData, layer: WeatherLayer) {
  if (layer === "temperature") return region.temperature;
  if (layer === "cloudCover") return region.cloudCover;
  if (layer === "windSpeed") return region.windSpeed;
  if (layer === "solarPotential") return region.solarPotential;
  return riskWeight(region.riskLevel) * 20;
}

function projectRegion(region: RegionalEnergyData) {
  const minLng = -8.8;
  const maxLng = 12.2;
  const minLat = 18.5;
  const maxLat = 37.5;

  return {
    x: 13 + ((region.lng - minLng) / (maxLng - minLng)) * 74,
    y: 8 + ((maxLat - region.lat) / (maxLat - minLat)) * 84,
  };
}

function layerLabel(layer: WeatherLayer) {
  const labels: Record<WeatherLayer, string> = {
    temperature: "Temperature",
    cloudCover: "Cloud Cover",
    windSpeed: "Wind Speed",
    solarPotential: "Solar Potential",
    riskLevel: "Risk Level",
  };
  return labels[layer];
}
