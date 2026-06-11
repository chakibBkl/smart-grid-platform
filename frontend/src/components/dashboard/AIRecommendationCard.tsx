"use client";
import { useEffect, useState } from "react";
import { Bot, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import Link from "next/link";

export interface OperatorDecision {
  time: string;
  recommendation: string;
  decision: "Approved" | "Rejected";
  status: string;
}

interface AIRecommendationCardProps {
  action: string;
  reason: string;
  expectedImpact: string[];
  expectedSavingDZD: number;
  risk: string;
  confidence: number;
  onDecision: (decision: OperatorDecision) => void;
}

export function AIRecommendationCard(props: AIRecommendationCardProps) {
  const [lastDecision, setLastDecision] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nv-team-last-decision");
    if (saved) setLastDecision(saved);
  }, []);

  function decide(decision: "Approved" | "Rejected") {
    const entry: OperatorDecision = {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      recommendation: props.action,
      decision,
      status: decision === "Approved" ? "Stability target improved from 82% to 88%" : "Recommendation held for manual review",
    };
    localStorage.setItem("nv-team-last-decision", `${decision} at ${entry.time}`);
    setLastDecision(`${decision} at ${entry.time}`);
    props.onDecision(entry);
  }

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">AI Recommendation</p>
          <h2 className="mt-1 text-lg font-semibold">{props.action}</h2>
        </div>
        <Bot className="text-grid-500" size={22} />
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{props.reason}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {props.expectedImpact.map((impact) => (
          <div key={impact} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-xs font-medium">{impact}</div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-yellow-500">Risk {props.risk}</span>
        <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-2 py-1 text-grid-500">Confidence {props.confidence}%</span>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-blue-500">{props.expectedSavingDZD.toLocaleString()} DZD saving</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => decide("Approved")} className="inline-flex items-center gap-2 rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white"><CheckCircle2 size={15} />Approve Recommendation</button>
        <button onClick={() => decide("Rejected")} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold"><XCircle size={15} />Reject</button>
        <Link href="/assistant" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold"><MessageSquare size={15} />Explain Recommendation</Link>
      </div>
      {lastDecision && <p className="mt-3 text-xs text-[var(--text-secondary)]">Last local decision: {lastDecision}</p>}
    </section>
  );
}
