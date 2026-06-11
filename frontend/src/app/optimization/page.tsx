"use client";
import { BatteryCharging, CheckCircle2, Clock, ShieldAlert, Zap } from "lucide-react";
import { BarChart } from "@/components/charts/BarChart";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { DecisionExplanationBox } from "@/components/dashboard/DecisionExplanationBox";
import { EnergyBalancePanel } from "@/components/dashboard/EnergyBalancePanel";
import { PeakPressureCard } from "@/components/dashboard/PeakPressureCard";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { StatCard } from "@/components/dashboard/StatCard";
import { demoEnergyBalance, demoForecastConfidence, demoPeakPressure } from "@/lib/dashboard/demoOperationalData";
import { recommendation } from "@/lib/dashboard/demoDashboardData";

const dispatchPlan = [
  { name: "16:00", battery: 5, demandResponse: 0, gridSupport: 38 },
  { name: "17:00", battery: 12, demandResponse: 4, gridSupport: 44 },
  { name: "18:00", battery: 28, demandResponse: 8, gridSupport: 52 },
  { name: "19:00", battery: 40, demandResponse: 13, gridSupport: 57 },
  { name: "20:00", battery: 34, demandResponse: 10, gridSupport: 50 },
  { name: "21:00", battery: 21, demandResponse: 6, gridSupport: 43 },
];

const scenarios = [
  { name: "Base dispatch", cost: 920, risk: 54, stability: 82 },
  { name: "Battery support", cost: 760, risk: 38, stability: 88 },
  { name: "Demand response", cost: 810, risk: 42, stability: 86 },
  { name: "Hybrid action", cost: 690, risk: 31, stability: 91 },
];

export default function OptimizationPage() {
  const totalSupply = demoEnergyBalance.solarMW + demoEnergyBalance.windMW + demoEnergyBalance.batteryMW + demoEnergyBalance.conventionalSupportMW;
  const reserveMargin = ((totalSupply - demoEnergyBalance.demandMW) / demoEnergyBalance.demandMW) * 100;

  return (
    <div className="space-y-6">
      <header className="animate-fade-up relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-grid-500 via-cyan-400 to-transparent" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Optimization Control Center</h1>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              Human-controlled dispatch planning for battery support, demand response, reserve margin, and grid stability. The system recommends actions; the operator approves them.
            </p>
          </div>
          <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">Decision Support</span>
        </div>
      </header>

      <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={BatteryCharging} label="Recommended Action" value="Battery discharge" detail="18:00-21:00" />
        <Kpi icon={Zap} label="Expected Saving" value={`${recommendation.expectedSavingDZD.toLocaleString()} DZD`} detail="demo estimate" />
        <Kpi icon={ShieldAlert} label="Peak Pressure" value={demoPeakPressure.level} detail={demoPeakPressure.expectedPeakHour} />
        <Kpi icon={CheckCircle2} label="Forecast Confidence" value={`${demoForecastConfidence.load}%`} detail={demoForecastConfidence.model} />
        <Kpi icon={Clock} label="Reserve Margin" value={`${reserveMargin.toFixed(1)}%`} detail="current plan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <EnergyBalancePanel />
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 xl:col-span-2">
          <h2 className="text-sm font-semibold">Optimized Dispatch Plan</h2>
          <p className="mb-4 mt-1 text-xs text-[var(--text-secondary)]">Battery, demand response, and grid support by peak-hour window.</p>
          <BarChart data={dispatchPlan} bars={[
            { dataKey: "battery", color: "#22c55e", name: "Battery MW" },
            { dataKey: "demandResponse", color: "#3b82f6", name: "Demand Response MW" },
            { dataKey: "gridSupport", color: "#f97316", name: "Grid Support MW" },
          ]} height={290} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ActionCenter />
        <PeakPressureCard />
        <WhatIfSimulator />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Scenario Comparison</h2>
          <p className="mb-4 mt-1 text-xs text-[var(--text-secondary)]">Lower cost and lower risk are better; stability should remain high.</p>
          <BarChart data={scenarios} bars={[
            { dataKey: "cost", color: "#a855f7", name: "Cost x1000 DZD" },
            { dataKey: "risk", color: "#ef4444", name: "Risk Score" },
            { dataKey: "stability", color: "#22c55e", name: "Stability %" },
          ]} height={280} />
        </section>
        <DecisionExplanationBox />
      </div>
    </div>
  );
}

function Kpi(props: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return <StatCard {...props} />;
}
