export type DigitalTwinRenderMode = "3d" | "fallback";
export type DigitalTwinViewMode = "3d" | "flow" | "status";

export function DigitalTwinControls({
  renderMode,
  viewMode,
  showCards,
  showLabels,
  showLines,
  showGeographicLayer,
  onRenderModeChange,
  onViewModeChange,
  onToggleCards,
  onToggleLabels,
  onToggleLines,
  onToggleGeographicLayer,
  onZoomIn,
  onZoomOut,
  onResetCamera,
}: {
  renderMode: DigitalTwinRenderMode;
  viewMode: DigitalTwinViewMode;
  showCards: boolean;
  showLabels: boolean;
  showLines: boolean;
  showGeographicLayer: boolean;
  onRenderModeChange: (mode: DigitalTwinRenderMode) => void;
  onViewModeChange: (mode: DigitalTwinViewMode) => void;
  onToggleCards: () => void;
  onToggleLabels: () => void;
  onToggleLines: () => void;
  onToggleGeographicLayer: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
        {([
          ["3d", "3D View"],
          ["flow", "Flow View"],
          ["status", "Asset Status"],
        ] as const).map(([item, label]) => (
          <button key={item} onClick={() => onViewModeChange(item)} className={`rounded-md px-3 py-1 text-xs font-semibold ${viewMode === item ? "bg-grid-500 text-white" : "text-[var(--text-secondary)]"}`}>
            {label}
          </button>
        ))}
      </div>
      <button onClick={onResetCamera} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
        Reset View
      </button>
      <button onClick={onZoomIn} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
        Zoom In
      </button>
      <button onClick={onZoomOut} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
        Zoom Out
      </button>
      <ToggleButton label="Cards" active={showCards} onClick={onToggleCards} />
      <ToggleButton label="Labels" active={showLabels} onClick={onToggleLabels} />
      <ToggleButton label="Lines" active={showLines} onClick={onToggleLines} />
      <ToggleButton label="Zones/Map" active={showGeographicLayer} onClick={onToggleGeographicLayer} />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
        {(["3d", "fallback"] as const).map((item) => (
          <button key={item} onClick={() => onRenderModeChange(item)} className={`rounded-md px-3 py-1 text-xs font-semibold ${renderMode === item ? "bg-slate-800 text-white" : "text-[var(--text-secondary)]"}`}>
            {item === "3d" ? "WebGL" : "Fallback"}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-lg border px-3 py-1 text-xs font-semibold ${active ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-500" : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"}`}>
      {label}: {active ? "ON" : "OFF"}
    </button>
  );
}
