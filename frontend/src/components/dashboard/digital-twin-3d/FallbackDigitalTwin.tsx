"use client";
import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  Cpu,
  Factory,
  Gauge,
  MonitorCheck,
  Radio,
  Sun,
  ThermometerSun,
  Wind,
  Zap,
} from "lucide-react";
import type { DeviceData, DeviceStatus, DeviceType } from "@/lib/dashboard/deviceTypes";
import type { DigitalTwinViewMode } from "./DigitalTwinControls";
import { statusClass, statusColor } from "./DeviceStatusBadge";

type NodePosition = { left: number; top: number };

const layoutByType: Partial<Record<DeviceType, NodePosition>> = {
  sensor_network: { left: 50, top: 12 },
  weather_station: { left: 19, top: 18 },
  wind_site: { left: 81, top: 18 },
  solar_plant: { left: 13, top: 46 },
  data_hub: { left: 50, top: 45 },
  transformer: { left: 86, top: 46 },
  smart_meter: { left: 19, top: 78 },
  battery: { left: 46, top: 82 },
  industrial_load_zone: { left: 73, top: 78 },
};

const dashboardOutput = { left: 90, top: 64 };
const hubCenter = { left: 50, top: 45 };

const iconByType: Record<DeviceType, LucideIcon> = {
  smart_meter: Gauge,
  weather_station: ThermometerSun,
  solar_plant: Sun,
  wind_site: Wind,
  battery: BatteryCharging,
  transformer: Zap,
  sensor_network: Radio,
  industrial_load_zone: Factory,
  data_hub: Cpu,
};

export function FallbackDigitalTwin({
  devices,
  selectedId,
  showCards,
  showLabels,
  showLines,
  showZones,
  viewMode,
  onSelect,
}: {
  devices: DeviceData[];
  selectedId?: string;
  showCards: boolean;
  showLabels: boolean;
  showLines: boolean;
  showZones: boolean;
  viewMode: DigitalTwinViewMode;
  onSelect: (device: DeviceData) => void;
}) {
  const hub = devices.find((device) => device.type === "data_hub");
  const selected = devices.find((device) => device.id === selectedId);

  if (devices.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-slate-950 p-6 text-center text-sm text-slate-300">
        No digital twin device data available for this region yet.
      </div>
    );
  }

  return (
    <div className="relative min-h-[680px] overflow-hidden rounded-xl border border-slate-700 bg-[radial-gradient(circle_at_50%_42%,#0d2a40_0%,#071426_46%,#020617_100%)] p-4 shadow-inner">
      <style>{`
        @keyframes dtDash { to { stroke-dashoffset: -24; } }
        @keyframes dtFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes dtSweep { to { transform: rotate(360deg); } }
        @keyframes dtPulseRing { 0% { transform: scale(.55); opacity: .5; } 100% { transform: scale(1.65); opacity: 0; } }
        @keyframes dtScan { 0% { top: -8%; } 100% { top: 108%; } }
        .dt-dash { animation: dtDash 1.5s linear infinite; }
        .dt-dash-slow { animation: dtDash 2.6s linear infinite; }
        .dt-float { animation: dtFloat 6s ease-in-out infinite; }
        .dt-sweep { animation: dtSweep 9s linear infinite; }
        .dt-pulse-ring { animation: dtPulseRing 2.6s ease-out infinite; }
        .dt-scanline { animation: dtScan 11s linear infinite; }
      `}</style>

      <SceneBackground showZones={showZones} />
      {showLines && hub && <ConnectionLines devices={devices} selected={selected} viewMode={viewMode} />}

      <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,.18)]">Fallback pseudo-3D mode</span>
        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-[11px] font-semibold text-blue-200">Demo Mode - Simulated Regional Device Data</span>
      </div>

      {devices.map((device, index) => (
        <DeviceCard
          key={device.id}
          device={device}
          selected={selectedId === device.id}
          compact={!showCards}
          showLabels={showLabels}
          floatDelay={index * 0.7}
          onSelect={onSelect}
        />
      ))}
      {hub && <DashboardOutputCard devices={devices} hubSelected={selectedId === hub.id} />}

      <div className="absolute bottom-3 left-4 z-20 rounded-full border border-cyan-500/15 bg-slate-950/70 px-3 py-1.5 text-[10px] text-slate-400 backdrop-blur">
        Decision-support only — critical grid actions require human approval.
      </div>
    </div>
  );
}

function SceneBackground({ showZones }: { showZones: boolean }) {
  return (
    <>
      {/* fine engineering grid */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.09) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* starfield */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,.5), transparent 50%), radial-gradient(1px 1px at 78% 12%, rgba(255,255,255,.4), transparent 50%), radial-gradient(1.5px 1.5px at 36% 64%, rgba(186,230,253,.4), transparent 50%), radial-gradient(1px 1px at 64% 82%, rgba(255,255,255,.35), transparent 50%), radial-gradient(1px 1px at 90% 56%, rgba(186,230,253,.4), transparent 50%), radial-gradient(1.5px 1.5px at 24% 88%, rgba(255,255,255,.3), transparent 50%)",
          backgroundSize: "420px 420px",
        }}
      />
      {/* aurora glows */}
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute left-1/3 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

      {/* radar rings centred on the AI hub */}
      <div className="pointer-events-none absolute" style={{ left: `${hubCenter.left}%`, top: `${hubCenter.top}%` }}>
        {[230, 420, 620].map((size) => (
          <div
            key={size}
            className="absolute rounded-full border border-cyan-300/15"
            style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
          />
        ))}
        <div
          className="dt-sweep absolute rounded-full"
          style={{
            width: 620,
            height: 620,
            left: -310,
            top: -310,
            background: "conic-gradient(from 0deg, rgba(34,211,238,.13), transparent 70deg)",
          }}
        />
      </div>

      {/* scanline */}
      <div className="dt-scanline absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />

      {showZones && (
        <>
          <ZoneLabel text="Monitoring & Sensors" className="left-1/2 top-[4.5%] -translate-x-1/2 border-cyan-400/25 text-cyan-200" />
          <ZoneLabel text="Renewable Production" className="left-[4%] top-[33%] border-emerald-400/25 text-emerald-200" />
          <ZoneLabel text="Grid Assets" className="right-[4%] top-[33%] border-blue-400/25 text-blue-200" />
          <ZoneLabel text="Demand Zone" className="left-[64%] top-[90%] border-amber-400/25 text-amber-200" />
          <ZoneLabel text="AI Processing Core" className="left-1/2 top-[54.5%] -translate-x-1/2 border-fuchsia-300/25 text-fuchsia-200" />
        </>
      )}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(2,6,23,.7)_100%)]" />
    </>
  );
}

function ZoneLabel({ text, className }: { text: string; className: string }) {
  return (
    <span className={`absolute z-[2] rounded-full border bg-slate-950/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest opacity-80 backdrop-blur ${className}`}>
      {text}
    </span>
  );
}

function ConnectionLines({ devices, selected, viewMode }: { devices: DeviceData[]; selected?: DeviceData; viewMode: DigitalTwinViewMode }) {
  const hub = devices.find((device) => device.type === "data_hub");
  if (!hub) return null;
  const transformer = devices.find((device) => device.type === "transformer");
  const flow = viewMode === "flow";
  const dataOpacity = flow ? 0.85 : 0.4;
  return (
    <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="fallback-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {devices.filter((device) => device.type !== "data_hub").map((device, i) => (
        <FlowPath
          key={`${device.id}-data`}
          from={nodePosition(device)}
          to={nodePosition(hub)}
          color="#22d3ee"
          opacity={isSelectedConnection(device, hub, selected) ? 0.95 : dataOpacity}
          width={isSelectedConnection(device, hub, selected) ? 0.32 : 0.16}
          dashed
          pulse={flow || isSelectedConnection(device, hub, selected)}
          pulseDelay={i * 0.4}
        />
      ))}

      <FlowPath
        from={nodePosition(hub)}
        to={dashboardOutput}
        color="#a3e635"
        opacity={selected?.type === "data_hub" ? 0.95 : 0.7}
        width={0.3}
        dashed
        pulse
        pulseDelay={0.2}
      />

      {transformer && energyPairs(devices).map(([from, to, bidirectional], i) => (
        <g key={`${from.id}-${to.id}-energy`}>
          <FlowPath
            from={nodePosition(from)}
            to={nodePosition(to)}
            color={bidirectional ? "#38bdf8" : "#facc15"}
            opacity={isSelectedConnection(from, to, selected) ? 0.95 : 0.6}
            width={0.3}
            pulse
            pulseDelay={i * 0.55}
          />
          {bidirectional && (
            <FlowPath from={nodePosition(to)} to={nodePosition(from)} color="#38bdf8" opacity={flow ? 0.7 : 0.28} width={0.18} dashed pulse={flow} pulseDelay={1.1} />
          )}
        </g>
      ))}
    </svg>
  );
}

function FlowPath({
  from,
  to,
  color,
  opacity,
  width,
  dashed = false,
  pulse = false,
  pulseDelay = 0,
}: {
  from: NodePosition;
  to: NodePosition;
  color: string;
  opacity: number;
  width: number;
  dashed?: boolean;
  pulse?: boolean;
  pulseDelay?: number;
}) {
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const len = Math.max(1, Math.hypot(dx, dy));
  const bow = Math.min(6, len * 0.16);
  const cx = (from.left + to.left) / 2 - (dy / len) * bow;
  const cy = (from.top + to.top) / 2 + (dx / len) * bow;
  const d = `M ${from.left} ${from.top} Q ${cx} ${cy} ${to.left} ${to.top}`;
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeWidth={width * 2.6} opacity={opacity * 0.16} filter="url(#fallback-glow)" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        opacity={opacity}
        strokeLinecap="round"
        strokeDasharray={dashed ? "1.2 1.2" : undefined}
        className={dashed ? "dt-dash" : undefined}
      />
      {pulse && (
        <circle r={width * 2.6} fill={color} opacity={0.95}>
          <animateMotion dur="2.6s" begin={`${pulseDelay}s`} repeatCount="indefinite" path={d} />
        </circle>
      )}
    </>
  );
}

function DeviceCard({
  device,
  selected,
  compact,
  showLabels,
  floatDelay,
  onSelect,
}: {
  device: DeviceData;
  selected: boolean;
  compact: boolean;
  showLabels: boolean;
  floatDelay: number;
  onSelect: (device: DeviceData) => void;
}) {
  const pos = nodePosition(device);
  const color = statusColor(device.status);
  const Icon = iconByType[device.type];
  const isHub = device.type === "data_hub";
  const bar = metricBar(device);

  return (
    <button
      onClick={() => onSelect(device)}
      className={`absolute -translate-x-1/2 -translate-y-1/2 text-left transition ${selected ? "z-30" : "z-10 hover:z-30"}`}
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
      title={device.name}
    >
      <div className="dt-float" style={{ animationDelay: `${floatDelay}s` }}>
        {isHub && (
          <>
            <span className="dt-pulse-ring absolute left-1/2 top-1/2 -ml-16 -mt-16 h-32 w-32 rounded-full border-2 border-cyan-300/50" />
            <span className="dt-pulse-ring absolute left-1/2 top-1/2 -ml-16 -mt-16 h-32 w-32 rounded-full border border-cyan-300/40" style={{ animationDelay: "1.3s" }} />
          </>
        )}

        {compact ? (
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full border bg-slate-950/85 shadow-lg backdrop-blur transition hover:scale-110 ${selected ? "border-cyan-300 ring-4 ring-cyan-400/25" : "border-white/15"}`}
            style={{ boxShadow: `0 0 18px ${color}44` }}
          >
            <Icon size={20} style={{ color }} />
          </span>
        ) : (
          <div
            className={`relative w-44 overflow-hidden rounded-2xl border p-3 shadow-2xl backdrop-blur-md transition hover:scale-[1.04] ${
              selected
                ? "border-cyan-300/80 bg-slate-950/95 ring-4 ring-cyan-400/20"
                : isHub
                  ? "border-cyan-400/40 bg-gradient-to-b from-slate-900/95 to-cyan-950/80"
                  : "border-white/10 bg-slate-900/85 hover:border-cyan-300/50"
            }`}
            style={{ boxShadow: selected ? `0 0 30px ${color}55` : `0 12px 30px rgba(2,6,23,.5), 0 0 16px ${color}22` }}
          >
            {/* status accent bar */}
            <span className="absolute inset-y-0 left-0 w-1" style={{ background: `linear-gradient(180deg, ${color}, transparent)` }} />

            <div className="flex items-start justify-between gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950/70"
                style={{ color, boxShadow: `0 0 12px ${color}33` }}
              >
                <Icon size={16} />
              </span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusClass(device.status)}`}>{device.status}</span>
            </div>

            <p className="mt-2 text-[11.5px] font-bold leading-tight text-white">{device.name}</p>
            {showLabels && <p className="mt-0.5 text-[9.5px] uppercase tracking-wide text-slate-400">{device.type.replace(/_/g, " ")}</p>}
            <p className="mt-1.5 text-[11px] font-semibold text-cyan-100">{metricSummary(device)}</p>

            {bar !== null && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function DashboardOutputCard({ devices, hubSelected }: { devices: DeviceData[]; hubSelected: boolean }) {
  const transformer = devices.find((device) => device.type === "transformer");
  const industrial = devices.find((device) => device.type === "industrial_load_zone");
  const battery = devices.find((device) => device.type === "battery");
  const status = industrial?.status || transformer?.status || "Normal";
  return (
    <div
      className={`absolute z-10 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-slate-950/90 p-3 text-left shadow-2xl backdrop-blur-md ${hubSelected ? "border-lime-300/70 shadow-lime-400/20" : "border-lime-300/25"}`}
      style={{ left: `${dashboardOutput.left}%`, top: `${dashboardOutput.top}%`, boxShadow: "0 12px 30px rgba(2,6,23,.5), 0 0 18px rgba(163,230,53,.15)" }}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-lime-400 to-transparent" />
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-950/70 text-lime-300 shadow-[0_0_12px_rgba(163,230,53,.25)]">
          <MonitorCheck size={16} />
        </span>
        <p className="text-xs font-bold text-lime-200">Dashboard Output</p>
      </div>
      <div className="mt-2 space-y-1 text-[11px] text-slate-300">
        <p className="flex justify-between">Risk <span className="font-semibold" style={{ color: statusColor(status) }}>{status}</span></p>
        <p className="flex justify-between">Grid Health <span className="font-semibold text-white">{transformer?.metrics.healthPercent ?? "N/A"}%</span></p>
        <p className="flex justify-between">Battery SOC <span className="font-semibold text-white">{battery?.metrics.socPercent ?? "N/A"}%</span></p>
      </div>
      <p className="mt-2 rounded-md bg-lime-400/10 px-2 py-1 text-center text-[10px] font-semibold text-lime-300">Recommendation Ready</p>
    </div>
  );
}

function nodePosition(device: DeviceData) {
  return layoutByType[device.type] || { left: 50 + device.position3D.x * 10, top: 48 + device.position3D.z * 9 };
}

function isSelectedConnection(a: DeviceData, b: DeviceData, selected?: DeviceData) {
  return selected?.id === a.id || selected?.id === b.id;
}

function energyPairs(devices: DeviceData[]): [DeviceData, DeviceData, boolean][] {
  const solar = devices.find((device) => device.type === "solar_plant");
  const wind = devices.find((device) => device.type === "wind_site");
  const battery = devices.find((device) => device.type === "battery");
  const transformer = devices.find((device) => device.type === "transformer");
  const industrial = devices.find((device) => device.type === "industrial_load_zone");
  const pairs: [DeviceData, DeviceData, boolean][] = [];
  if (solar && transformer) pairs.push([solar, transformer, false]);
  if (wind && transformer) pairs.push([wind, transformer, false]);
  if (battery && transformer) pairs.push([battery, transformer, true]);
  if (transformer && industrial) pairs.push([transformer, industrial, false]);
  return pairs;
}

function metricSummary(device: DeviceData) {
  const m = device.metrics;
  if (device.type === "solar_plant") return `${m.currentProductionMW} MW`;
  if (device.type === "wind_site") return `${m.currentProductionMW} MW`;
  if (device.type === "battery") return `SOC ${m.socPercent}%`;
  if (device.type === "transformer") return `Load ${m.loadingPercent}%`;
  if (device.type === "industrial_load_zone") return `${m.currentDemandMW} MW`;
  if (device.type === "smart_meter") return `${m.feederCount} feeders | ${m.sampleCoveragePercent}%`;
  if (device.type === "weather_station") return `${m.temperatureC} C | ${m.windSpeedKmh} km/h`;
  if (device.type === "sensor_network") return `${m.packetQualityPercent}% Quality`;
  if (device.type === "data_hub") return "Processing regional signals";
  return device.status;
}

function metricBar(device: DeviceData): number | null {
  const m = device.metrics;
  const value =
    device.type === "battery" ? m.socPercent
    : device.type === "transformer" ? m.loadingPercent
    : device.type === "sensor_network" ? m.packetQualityPercent
    : device.type === "smart_meter" ? m.sampleCoveragePercent
    : device.type === "wind_site" ? m.efficiencyPercent
    : null;
  const num = Number(value);
  return value !== null && Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : null;
}
