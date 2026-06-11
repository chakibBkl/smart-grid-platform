"use client";
import { useMemo, useState } from "react";
import { simulateWhatIf } from "@/lib/dashboard/whatIfSimulator";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";

export function WhatIfSimulator() {
  const [solarDropPct, setSolarDropPct] = useState(30);
  const [demandIncreasePct, setDemandIncreasePct] = useState(15);
  const [batterySOC, setBatterySOC] = useState(25);
  const [windDropPct, setWindDropPct] = useState(10);
  const [peakHour, setPeakHour] = useState(19);
  const result = useMemo(() => simulateWhatIf({ solarDropPct, demandIncreasePct, batterySOC, windDropPct, peakHour }), [solarDropPct, demandIncreasePct, batterySOC, windDropPct, peakHour]);

  const inputs = [
    { label: "Solar drop %", value: solarDropPct, set: setSolarDropPct, max: 60 },
    { label: "Demand increase %", value: demandIncreasePct, set: setDemandIncreasePct, max: 35 },
    { label: "Battery SOC %", value: batterySOC, set: setBatterySOC, max: 100 },
    { label: "Wind drop %", value: windDropPct, set: setWindDropPct, max: 45 },
    { label: "Peak hour", value: peakHour, set: setPeakHour, max: 23 },
  ];

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="text-sm font-semibold">What-If Simulator</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {inputs.map((input) => (
          <label key={input.label} className="text-xs text-[var(--text-secondary)]">
            <span className="flex justify-between"><span>{input.label}</span><span className="font-semibold text-[var(--text-primary)]">{input.value}</span></span>
            <input className="mt-2 w-full accent-green-500" type="range" min={0} max={input.max} value={input.value} onChange={(event) => input.set(Number(event.target.value))} />
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${riskBadgeClass(result.riskLevel)}`}>Risk {result.riskLevel}</span>
          <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-2 py-1 text-xs font-semibold text-grid-500">Health {result.gridHealth}%</span>
        </div>
        <p className="mt-3 text-sm">{result.recommendedAction}</p>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">Estimated cost impact: {result.estimatedCostImpactDZD.toLocaleString()} DZD at {peakHour}:00.</p>
      </div>
    </section>
  );
}
