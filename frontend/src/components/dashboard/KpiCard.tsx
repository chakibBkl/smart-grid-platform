"use client";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Zap, Sun, Wind, DollarSign, Battery, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiCard as KpiCardType } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  sun: Sun,
  wind: Wind,
  dollar: DollarSign,
  battery: Battery,
  thermometer: Thermometer,
};

const iconStyle: Record<string, string> = {
  zap: "from-amber-500/20 to-amber-500/5 text-amber-500",
  sun: "from-orange-500/20 to-orange-500/5 text-orange-500",
  wind: "from-cyan-500/20 to-cyan-500/5 text-cyan-500",
  dollar: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
  battery: "from-green-500/20 to-green-500/5 text-green-500",
  thermometer: "from-red-500/20 to-red-500/5 text-red-500",
};

function useCountUp(target: number, duration = 950) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return value;
}

function AnimatedValue({ raw }: { raw: string | number }) {
  const str = String(raw);
  const num = parseFloat(str.replace(/,/g, ""));
  const decimals = str.includes(".") ? (str.split(".")[1].match(/^\d+/)?.[0].length ?? 0) : 0;
  const animated = useCountUp(Number.isFinite(num) ? num : 0);
  if (!Number.isFinite(num)) return <>{raw}</>;
  return <>{animated.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

export function KpiCard({ title, value, unit, change, changeType, icon }: KpiCardType) {
  const Icon = iconMap[icon] || Zap;
  const accent = iconStyle[icon] || iconStyle.zap;
  const up = changeType === "increase";

  return (
    <div className="card-hover group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      {/* soft accent glow in the corner */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-grid-500/10 blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">{title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            <AnimatedValue raw={value} />
            <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">{unit}</span>
          </p>
        </div>
        <div className={cn("rounded-xl bg-gradient-to-br p-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", accent)}>
          <Icon size={20} />
        </div>
      </div>

      <div className="relative mt-2 flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}
        >
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}%
        </span>
        <span className="text-xs text-[var(--text-secondary)]">vs yesterday</span>
      </div>

      {/* animated baseline */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="energy-flow !h-0.5" />
      </div>
    </div>
  );
}
