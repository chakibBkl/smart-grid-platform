"use client";
import { AlertTriangle } from "lucide-react";
import type { RiskAlert } from "@/lib/dashboard/riskCalculations";
import { severityClass } from "@/lib/dashboard/riskCalculations";

export function RiskAlertCenter({ alerts }: { alerts: RiskAlert[] }) {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Risk Alert Center</h2>
          <p className="text-xs text-[var(--text-secondary)]">Operational risks generated from demo telemetry.</p>
        </div>
        <AlertTriangle className="text-yellow-500" size={20} />
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border border-[var(--border)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${severityClass(alert.severity)}`}>{alert.severity}</span>
                  <h3 className="text-sm font-semibold">{alert.title}</h3>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{alert.description}</p>
                <p className="mt-2 text-xs font-medium text-grid-500">{alert.recommendedAction}</p>
              </div>
              <span className="shrink-0 text-xs text-[var(--text-secondary)]">{alert.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
