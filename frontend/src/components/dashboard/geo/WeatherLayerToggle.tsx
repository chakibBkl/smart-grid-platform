"use client";

export type WeatherLayer = "temperature" | "cloudCover" | "windSpeed" | "solarPotential" | "riskLevel";

const layers: { id: WeatherLayer; label: string }[] = [
  { id: "temperature", label: "Temperature" },
  { id: "cloudCover", label: "Cloud Cover" },
  { id: "windSpeed", label: "Wind Speed" },
  { id: "solarPotential", label: "Solar Potential" },
  { id: "riskLevel", label: "Risk Level" },
];

export function WeatherLayerToggle({ value, onChange }: { value: WeatherLayer; onChange: (layer: WeatherLayer) => void }) {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="text-sm font-semibold">Weather Layer Controls</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onChange(layer.id)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${value === layer.id ? "border-grid-500 bg-grid-500/10 text-grid-500" : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
          >
            {layer.label}
          </button>
        ))}
      </div>
    </section>
  );
}
