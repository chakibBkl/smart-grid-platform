"use client";
import { Radar } from "lucide-react";
import { demoAnomalies } from "@/lib/dashboard/demoOperationalData";

export function AnomalyDetectionPanel() {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">AI Anomaly Detection</h2>
          <p className="text-xs text-[var(--text-secondary)]">Demo logic flags unusual operational patterns.</p>
        </div>
        <Radar className="text-orange-500" size={20} />
      </div>
      <div className="space-y-3">
        {demoAnomalies.map((anomaly) => (
          <div key={anomaly.id} className="rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{anomaly.description}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityClass(anomaly.severity)}`}>{anomaly.severity}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{anomaly.region} - {anomaly.type} - {anomaly.timestamp}</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">Possible cause: {anomaly.possibleCause}</p>
            <p className="mt-1 text-xs font-medium text-grid-500">{anomaly.recommendedAction}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function severityClass(severity: string) {
  if (severity === "Critical" || severity === "High") return "border-orange-500/40 bg-orange-500/10 text-orange-500";
  return "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
}
