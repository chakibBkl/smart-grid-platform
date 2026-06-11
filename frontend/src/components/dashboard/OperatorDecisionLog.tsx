"use client";
import type { OperatorDecision } from "./AIRecommendationCard";

export function OperatorDecisionLog({ decisions }: { decisions: OperatorDecision[] }) {
  const fallback: OperatorDecision[] = [
    { time: "18:04", recommendation: "System recommended battery discharge", decision: "Approved", status: "Stability improved from 82% to 88%" },
    { time: "17:42", recommendation: "Monitor renewable deviation", decision: "Approved", status: "Operator kept dispatch under review" },
  ];
  const items = decisions.length > 0 ? decisions : fallback;

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="text-sm font-semibold">Operator Decision Log</h2>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.time}-${index}`} className="border-l-2 border-grid-500 pl-3">
            <p className="text-xs font-semibold">{item.time} - {item.decision}</p>
            <p className="text-xs text-[var(--text-secondary)]">{item.recommendation}</p>
            <p className="mt-1 text-xs text-grid-500">{item.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
