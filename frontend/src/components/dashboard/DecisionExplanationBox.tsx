"use client";
import { BrainCircuit } from "lucide-react";
import { demoForecastConfidence } from "@/lib/dashboard/demoOperationalData";

export function DecisionExplanationBox() {
  const factors = [
    "Evening peak expected at 19:00",
    "Battery SOC is 54%",
    `Forecast confidence is ${demoForecastConfidence.load}%`,
    `Data quality is ${demoForecastConfidence.dataQuality}%`,
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Decision Explanation</h2>
        <BrainCircuit className="text-grid-500" size={20} />
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Recommendation</p>
          <p className="mt-1">Discharge battery from 18:00 to 21:00.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Why</p>
          <p className="mt-1 text-[var(--text-secondary)]">Load is expected to increase by 14% while solar generation is expected to drop by 22%.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Key factors</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
            {factors.map((factor) => <li key={factor}>- {factor}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-grid-500/20 bg-grid-500/10 p-3 text-xs text-[var(--text-secondary)]">
          Human control: This is a decision-support recommendation. Final approval remains with the operator.
        </div>
      </div>
    </section>
  );
}
