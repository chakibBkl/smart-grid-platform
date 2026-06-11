"use client";
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { getRegionalDevices } from "@/lib/dashboard/demoRegionalDevices";
import type { DeviceData } from "@/lib/dashboard/deviceTypes";
import { DeviceDetailsPanel } from "./DeviceDetailsPanel";
import { DigitalTwinControls, type DigitalTwinRenderMode, type DigitalTwinViewMode } from "./DigitalTwinControls";
import { DigitalTwinLegend } from "./DigitalTwinLegend";
import { EnergyScene } from "./EnergyScene";
import { FallbackDigitalTwin } from "./FallbackDigitalTwin";

export default function RegionalDigitalTwin3D({ regionId, regionName }: { regionId: string; regionName: string }) {
  const devices = useMemo(() => getRegionalDevices(regionId), [regionId]);
  const defaultDevice = devices.find((device) => device.type === "data_hub") || devices[0] || null;
  const [selected, setSelected] = useState<DeviceData | null>(defaultDevice);
  const [panelOpen, setPanelOpen] = useState(false);
  const [renderMode, setRenderMode] = useState<DigitalTwinRenderMode>("3d");
  const [viewMode, setViewMode] = useState<DigitalTwinViewMode>("3d");
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [cameraZoomCommand, setCameraZoomCommand] = useState({ id: 0, direction: 0 });
  const [showCards, setShowCards] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showGeographicLayer, setShowGeographicLayer] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);

  function selectDevice(device: DeviceData) {
    setSelected(device);
    setPanelOpen(true);
  }

  const showFallback = renderMode === "fallback" || webglFailed;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{regionName} 3D Digital Twin</h2>
          <p className="mt-1 max-w-4xl text-xs text-[var(--text-secondary)]">
            Demo Mode - Simulated Device Data. This digital twin uses simulated regional device data for MVP demonstration and is pilot-ready for SCADA, smart meters, renewable plant APIs, battery systems, and weather feeds.
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Decision-support only. Critical grid actions still require human approval.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DigitalTwinLegend />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
        <p className="text-xs text-[var(--text-secondary)]">Pilot-ready for SCADA, smart meters, renewable plant APIs, battery systems, and weather feeds.</p>
        <DigitalTwinControls
          renderMode={showFallback ? "fallback" : "3d"}
          viewMode={viewMode}
          showCards={showCards}
          showLabels={showLabels}
          showLines={showLines}
          showGeographicLayer={showGeographicLayer}
          onRenderModeChange={(value) => { setRenderMode(value); if (value === "3d") setWebglFailed(false); }}
          onViewModeChange={setViewMode}
          onToggleCards={() => setShowCards((value) => !value)}
          onToggleLabels={() => setShowLabels((value) => !value)}
          onToggleLines={() => setShowLines((value) => !value)}
          onToggleGeographicLayer={() => setShowGeographicLayer((value) => !value)}
          onZoomIn={() => setCameraZoomCommand((value) => ({ id: value.id + 1, direction: -1 }))}
          onZoomOut={() => setCameraZoomCommand((value) => ({ id: value.id + 1, direction: 1 }))}
          onResetCamera={() => {
            if (showFallback) setSelected(defaultDevice);
            setCameraResetKey((value) => value + 1);
          }}
        />
      </div>

      <div className="relative mt-4">
        {showFallback ? (
          <FallbackDigitalTwin
            devices={devices}
            selectedId={selected?.id}
            showCards={showCards}
            showLabels={showLabels}
            showLines={showLines}
            showZones={showGeographicLayer}
            viewMode={viewMode}
            onSelect={selectDevice}
          />
        ) : (
          <div className="h-[560px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
            <Canvas shadows dpr={[1, 2]} gl={{ toneMappingExposure: 1.05 }} camera={{ position: [5.2, 4.3, 6.0], fov: 48 }} onCreated={() => setWebglFailed(false)} onError={() => setWebglFailed(true)}>
              <Suspense fallback={null}>
                <EnergyScene
                  devices={devices}
                  selectedId={selected?.id}
                  viewMode={viewMode}
                  showCards={showCards}
                  showLabels={showLabels}
                  showLines={showLines}
                  showGeographicLayer={showGeographicLayer}
                  cameraResetKey={cameraResetKey}
                  cameraZoomCommand={cameraZoomCommand}
                  onSelect={selectDevice}
                />
              </Suspense>
            </Canvas>
          </div>
        )}

        {/* hint when nothing is open */}
        {!panelOpen && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-cyan-400/25 bg-slate-950/80 px-4 py-1.5 text-[11px] font-medium text-cyan-200 backdrop-blur">
            Click any device to inspect its live details
          </div>
        )}

        {/* slide-in device details drawer */}
        <div
          className={`absolute inset-y-0 right-0 z-30 w-full max-w-[370px] p-2 transition-all duration-300 ease-out ${
            panelOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[60%] opacity-0"
          }`}
        >
          <div className="h-full overflow-y-auto rounded-xl shadow-2xl">
            <DeviceDetailsPanel device={selected} onClose={() => setPanelOpen(false)} />
          </div>
        </div>
      </div>
    </section>
  );
}
