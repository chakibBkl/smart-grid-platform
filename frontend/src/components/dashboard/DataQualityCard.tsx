"use client";
import { Database } from "lucide-react";
import { dataQuality } from "@/lib/dashboard/demoDashboardData";

export function DataQualityCard() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Data Quality</p>
          <p className="mt-1 text-3xl font-bold">{dataQuality.score}<span className="text-sm text-[var(--text-secondary)]">%</span></p>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500"><Database size={22} /></div>
      </div>
      <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
        <p>Missing data: {dataQuality.missingDataPct}%</p>
        <p>Sensor delay: {dataQuality.sensorDelaySeconds}s</p>
        <p>Last update: {dataQuality.lastUpdate}</p>
        <p>Source: {dataQuality.source}</p>
      </div>
    </div>
  );
}
