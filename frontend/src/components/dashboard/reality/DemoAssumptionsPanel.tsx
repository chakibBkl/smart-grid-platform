import { demoAssumptions } from "@/lib/reality/demoAssumptions";
import { RealityModeBadge } from "./RealityModeBadge";

export function DemoAssumptionsPanel() {
  return (
    <section className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Data Reality & Assumptions</h2>
        <RealityModeBadge />
      </div>
      <ul className="mt-3 grid gap-2 text-xs text-[var(--text-secondary)] md:grid-cols-2">
        {demoAssumptions.map((item) => (
          <li key={item} className="rounded-lg bg-[var(--bg-card)] p-3">{item}</li>
        ))}
      </ul>
    </section>
  );
}
