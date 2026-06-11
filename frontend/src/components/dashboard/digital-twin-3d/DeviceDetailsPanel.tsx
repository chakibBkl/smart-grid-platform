"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DeviceData } from "@/lib/dashboard/deviceTypes";
import { DeviceStatusBadge } from "./DeviceStatusBadge";

export function DeviceDetailsPanel({ device, onClose }: { device: DeviceData | null; onClose?: () => void }) {
  const [activeView, setActiveView] = useState<"none" | "explain" | "history">("none");

  useEffect(() => {
    setActiveView("none");
  }, [device?.id]);

  if (!device) {
    return (
      <aside className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <h2 className="text-sm font-semibold">Device Details</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Select a device in the digital twin to inspect metrics, alerts, and recommendations.</p>
      </aside>
    );
  }

  return (
    <aside className="animate-fade-in relative min-h-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      {/* status accent strip */}
      <span
        className={`absolute inset-x-0 top-0 h-1 ${
          device.status === "Critical" ? "bg-red-500" : device.status === "Warning" ? "bg-yellow-500" : device.status === "Offline" ? "bg-slate-500" : "bg-grid-500"
        }`}
      />
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <h2 className="text-sm font-semibold">{device.name}</h2>
          <p className="mt-1 text-xs capitalize text-[var(--text-secondary)]">{device.type.replace(/_/g, " ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <DeviceStatusBadge status={device.status} />
          {onClose && (
            <button onClick={onClose} className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]" title="Close details">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <Info label="Region" value={device.regionName} />
        <Info label="Device ID" value={device.id} />
        <Info label="Last Update" value={new Date(device.lastUpdate).toLocaleString()} />
        <Info label="Data Source" value={device.dataSource} />
        <Info label="Data Mode" value={device.dataMode} />
        <Info label="Data Quality" value={`${device.dataQuality}%`} />
        <Info label="Confidence" value={`${Math.round(device.confidence * 100)}%`} />
      </div>

      <section className="mt-4">
        <h3 className="text-xs font-semibold">Metrics</h3>
        <div className="mt-2 grid gap-2">
          {Object.entries(device.metrics).map(([key, value]) => (
            <Info key={key} label={readable(key)} value={String(value)} />
          ))}
        </div>
      </section>

      <section className="mt-4">
        <h3 className="text-xs font-semibold">Alerts</h3>
        <div className="mt-2 space-y-2">
          {device.alerts.length === 0 && <p className="rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">No active alerts</p>}
          {device.alerts.map((alert) => <p key={alert} className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-600">{alert}</p>)}
        </div>
      </section>

      <section className="mt-4 rounded-lg bg-grid-500/10 p-3">
        <h3 className="text-xs font-semibold text-grid-500">Recommendation</h3>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{device.recommendation}</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{device.explanation}</p>
      </section>

      <p className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">Decision-support only. Human approval is required for critical operational actions.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setActiveView((view) => view === "explain" ? "none" : "explain")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeView === "explain" ? "bg-grid-600 text-white" : "bg-grid-500 text-white"}`}>Explain Device State</button>
        <button onClick={() => setActiveView((view) => view === "history" ? "none" : "history")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${activeView === "history" ? "border-grid-500 bg-grid-500/10 text-grid-500" : "border-[var(--border)]"}`}>View Device History</button>
        {onClose && <button onClick={onClose} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">Close</button>}
      </div>
      {activeView === "explain" && <DeviceExplanation device={device} />}
      {activeView === "history" && <DeviceHistory device={device} />}
      <div className="mt-3 rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">
        Demo timeline: latest sample received, quality validated, AI risk check completed, recommendation generated.
      </div>
    </aside>
  );
}

function DeviceExplanation({ device }: { device: DeviceData }) {
  const statusMeaning = device.status === "Normal"
    ? "the device is operating inside the simulated safe band"
    : device.status === "Warning"
      ? "the device needs operator attention before any critical approval"
      : device.status === "Critical"
        ? "the device should be treated as a high-priority operational risk"
        : "the device is currently unavailable in the demo telemetry model";

  return (
    <section className="mt-3 rounded-lg border border-grid-500/20 bg-grid-500/10 p-3">
      <h3 className="text-xs font-semibold text-grid-500">AI Device State Explanation</h3>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">
        {device.name} is marked <strong className="text-[var(--text-primary)]">{device.status}</strong> because {statusMeaning}. The model uses data quality, confidence, current metrics, alerts, and regional context to prepare this explanation.
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <Info label="Decision Basis" value={`${device.dataQuality}% data quality`} />
        <Info label="Confidence" value={`${Math.round(device.confidence * 100)}%`} />
        <Info label="Approval Rule" value="Human required" />
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">{device.explanation}</p>
    </section>
  );
}

function DeviceHistory({ device }: { device: DeviceData }) {
  const timeline = buildHistory(device);
  return (
    <section className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
      <h3 className="text-xs font-semibold">Device History</h3>
      <div className="mt-3 space-y-2">
        {timeline.map((item) => (
          <div key={item.time} className="rounded-lg bg-[var(--bg-card)] p-3">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">{item.time}</p>
            <p className="mt-1 text-xs font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildHistory(device: DeviceData) {
  return [
    {
      time: "Latest sample",
      title: `${device.status} state confirmed`,
      detail: `Received from ${device.dataSource}. Data quality ${device.dataQuality}% and confidence ${Math.round(device.confidence * 100)}%.`,
    },
    {
      time: "Validation",
      title: "Telemetry quality checked",
      detail: device.alerts.length > 0 ? device.alerts[0] : "No active alerts detected in the simulated telemetry window.",
    },
    {
      time: "AI review",
      title: "Recommendation generated",
      detail: device.recommendation,
    },
  ];
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold">{value}</p>
    </div>
  );
}

function readable(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (value) => value.toUpperCase());
}
