"use client";
import { Gauge } from "lucide-react";
import { demoPeakPressure } from "@/lib/dashboard/demoOperationalData";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";

export function PeakPressureCard() {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Peak Pressure</h2>
        <Gauge className="text-orange-500" size={20} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${riskBadgeClass(demoPeakPressure.level)}`}>{demoPeakPressure.level}</span>
        <span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs">{demoPeakPressure.expectedPeakHour}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Affected Region" value={demoPeakPressure.affectedRegion} />
        <Metric label="Expected Load" value={`${demoPeakPressure.expectedLoadMW} MW`} />
      </div>
      <p className="mt-4 text-sm font-medium">{demoPeakPressure.recommendedAction}</p>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">{demoPeakPressure.reason}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--bg-secondary)] p-3"><p className="text-[11px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
