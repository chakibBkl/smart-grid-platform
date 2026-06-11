"use client";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { GridHealthResult } from "@/lib/dashboard/calculateGridHealth";

function useCountUp(target: number, duration = 1100) {
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

function healthColor(score: number) {
  if (score >= 85) return { stroke: "#22c55e", glow: "rgba(34,197,94,.45)", text: "text-green-500" };
  if (score >= 70) return { stroke: "#eab308", glow: "rgba(234,179,8,.45)", text: "text-yellow-500" };
  return { stroke: "#ef4444", glow: "rgba(239,68,68,.45)", text: "text-red-500" };
}

export function GridHealthCard({ result }: { result: GridHealthResult }) {
  const animated = useCountUp(result.score);
  const color = healthColor(result.score);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animated / 100);

  return (
    <div className="card-hover group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-grid-500/10 blur-2xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
            <ShieldCheck size={14} className="text-grid-500" /> Grid Health Score
          </p>
          <p className={`mt-1 text-4xl font-extrabold tabular-nums ${color.text}`}>
            {Math.round(animated)}
            <span className="text-sm font-normal text-[var(--text-secondary)]">%</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{result.reason}</p>
        </div>

        {/* circular gauge */}
        <div className="relative shrink-0">
          <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
            <circle cx="46" cy="46" r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
            <circle
              cx="46"
              cy="46"
              r={radius}
              fill="none"
              stroke={color.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ filter: `drop-shadow(0 0 6px ${color.glow})`, transition: "stroke-dashoffset .15s linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck size={24} style={{ color: color.stroke }} className="transition-transform duration-300 group-hover:scale-110" />
          </span>
        </div>
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${animated}%`, background: `linear-gradient(90deg, ${color.stroke}, #06b6d4)`, boxShadow: `0 0 10px ${color.glow}` }}
        />
      </div>
    </div>
  );
}
