"use client";
import { Zap, Sun, Wind, Battery, ArrowRight, Home, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnergyFlowProps {
  load: number;
  solar: number;
  wind: number;
  battery: number;
}

export function EnergyFlow({ load, solar, wind, battery }: EnergyFlowProps) {
  const totalGen = solar + wind;
  const gridImport = Math.max(0, load - totalGen - battery * 0.1);
  const isGreen = totalGen >= load * 0.5;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4">Energy Flow Visualization</h3>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SourceNode icon={Sun} label="Solar" value={solar} unit="MW" color="text-yellow-500" />
        <FlowArrow active={solar > 0} />
        <SourceNode icon={Wind} label="Wind" value={wind} unit="MW" color="text-blue-500" />
        <FlowArrow active={wind > 5} />
        <SourceNode icon={Battery} label="Battery" value={battery} unit="%" color="text-green-500" />
        <FlowArrow active={gridImport > 0} />
        <SourceNode icon={Zap} label="Grid" value={gridImport} unit="MW" color={isGreen ? "text-green-500" : "text-orange-500"} />
        <FlowArrow active />
        <div className="flex flex-col items-center gap-1">
          <div className="p-3 rounded-full bg-red-500/10">
            <Factory size={24} className="text-red-500" />
          </div>
          <span className="text-xs text-[var(--text-secondary)]">Load</span>
          <span className="text-sm font-bold">{load.toFixed(1)} MW</span>
        </div>
      </div>
      <div className={cn("energy-flow mt-4 rounded", solar > 0 ? "opacity-100" : "opacity-30")} />
    </div>
  );
}

function SourceNode({ icon: Icon, label, value, unit, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="p-3 rounded-full bg-[var(--bg-secondary)]">
        <Icon size={24} className={color} />
      </div>
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm font-bold">{value.toFixed(1)} <span className="text-xs font-normal text-[var(--text-secondary)]">{unit}</span></span>
    </div>
  );
}

function FlowArrow({ active }: { active: boolean }) {
  return (
    <ArrowRight
      size={24}
      className={cn(
        "transition-opacity",
        active ? "text-grid-500 opacity-100" : "text-[var(--border)] opacity-30"
      )}
    />
  );
}
