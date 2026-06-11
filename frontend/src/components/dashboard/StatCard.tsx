"use client";
import { useEffect, useRef, useState } from "react";

/** Shared animated KPI/stat card used across all control-center pages.
 *  Numbers count up on mount, the icon chip gets a colored gradient picked
 *  deterministically from the label, and the card lifts with a glow on hover. */

const accents = [
  { chip: "from-emerald-500/20 to-emerald-500/5 text-emerald-500", glow: "rgba(16,185,129,.16)" },
  { chip: "from-cyan-500/20 to-cyan-500/5 text-cyan-500", glow: "rgba(6,182,212,.16)" },
  { chip: "from-amber-500/20 to-amber-500/5 text-amber-500", glow: "rgba(245,158,11,.16)" },
  { chip: "from-violet-500/20 to-violet-500/5 text-violet-500", glow: "rgba(139,92,246,.16)" },
  { chip: "from-blue-500/20 to-blue-500/5 text-blue-500", glow: "rgba(59,130,246,.16)" },
  { chip: "from-rose-500/20 to-rose-500/5 text-rose-500", glow: "rgba(244,63,94,.16)" },
];

function accentFor(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) | 0;
  return accents[Math.abs(h) % accents.length];
}

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

/** Renders the value; if it starts with a number, that number counts up. */
function AnimatedValue({ value }: { value: string }) {
  const match = value.trim().match(/^([\d.,\s  ]+)(.*)$/);
  const numeric = match ? parseFloat(match[1].replace(/[^\d.]/g, "")) : NaN;
  const decimals = match && match[1].includes(".") ? (match[1].split(".")[1].replace(/[^\d]/g, "").length) : 0;
  const animated = useCountUp(Number.isFinite(numeric) ? numeric : 0);
  if (!match || !Number.isFinite(numeric)) return <>{value}</>;
  return (
    <>
      {animated.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {match[2]}
    </>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  const accent = accentFor(label);
  return (
    <section className="card-hover group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      {/* soft corner glow on hover */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: accent.glow }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
          <p className="mt-2 truncate text-xl font-extrabold tabular-nums" title={value}>
            <AnimatedValue value={value} />
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{detail}</p>
        </div>
        <div
          className={`shrink-0 rounded-xl bg-gradient-to-br p-2.5 shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 ${accent.chip}`}
        >
          <Icon size={20} />
        </div>
      </div>
      {/* animated energy baseline on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="energy-flow !h-0.5" />
      </div>
    </section>
  );
}
