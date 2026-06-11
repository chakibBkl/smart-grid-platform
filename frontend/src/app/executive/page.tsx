"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, ShieldAlert, ShieldCheck, Timer, TriangleAlert } from "lucide-react";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { AIRecommendationCard, type OperatorDecision } from "@/components/dashboard/AIRecommendationCard";
import { AnomalyDetectionPanel } from "@/components/dashboard/AnomalyDetectionPanel";
import { OperatorDecisionLog } from "@/components/dashboard/OperatorDecisionLog";
import { OperatorNotes } from "@/components/dashboard/OperatorNotes";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { demoActions, demoPeakPressure } from "@/lib/dashboard/demoOperationalData";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { getAuthSession } from "@/lib/auth/session";
import { getStoredScope } from "@/lib/dashboard/scope";

interface StoredDecision {
  title: string;
  status: string;
  user: string;
  role: string;
  timestamp: string;
}

export default function ActionsPage() {
  const [blocked, setBlocked] = useState(false);
  const [contextLabel, setContextLabel] = useState("National");
  const [decisions, setDecisions] = useState<OperatorDecision[]>([]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      setBlocked(true);
      return;
    }
    const stored = getStoredScope();
    const regionId = session.regionId || stored.regionId;
    const region = demoRegionalEnergyData.find((item) => item.id === regionId);
    setContextLabel(session.scope === "regional" && region ? region.name : "National");

    const key = session.scope === "regional" && regionId ? `decisionLog:region:${regionId}` : "decisionLog:national";
    const raw = localStorage.getItem(key);
    if (raw) {
      const entries = JSON.parse(raw) as StoredDecision[];
      setDecisions(
        entries.slice(0, 10).map((entry) => ({
          time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recommendation: entry.title,
          decision: entry.status === "Approved" ? "Approved" : "Rejected",
          status: `Decision by ${entry.user} (${entry.role.replace(/_/g, " ")})`,
        }))
      );
    }
  }, []);

  if (blocked) {
    return (
      <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-yellow-600" size={22} />
          <h1 className="text-2xl font-bold text-yellow-600">Login required</h1>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Please login to open the operator Action Center.</p>
        <Link href="/login" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Go to Login</Link>
      </section>
    );
  }

  const pending = demoActions.filter((action) => action.status === "Pending").length;
  const critical = demoActions.filter((action) => action.priority === "Critical" || action.priority === "High").length;

  return (
    <div className="space-y-6">
      <header className="animate-fade-up rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="text-grid-500" size={24} />
              <h1 className="text-2xl font-bold">{contextLabel} Action Center</h1>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              Review AI-generated operational recommendations, approve or reject actions, and keep a full operator decision trail. All critical actions remain under human approval.
            </p>
          </div>
          <RealityModeBadge />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatChip icon={Timer} label="Pending actions" value={`${pending}`} tone="text-blue-500 bg-blue-500/10 border-blue-500/30" />
          <StatChip icon={TriangleAlert} label="High priority" value={`${critical}`} tone="text-orange-500 bg-orange-500/10 border-orange-500/30" />
          <StatChip icon={ShieldCheck} label="Peak window" value={demoPeakPressure.expectedPeakHour} tone="text-grid-500 bg-grid-500/10 border-grid-500/30" />
        </div>
      </header>

      <div className="animate-fade-up stagger-2">
        <AIRecommendationCard
          action={demoPeakPressure.recommendedAction}
          reason={demoPeakPressure.reason}
          expectedImpact={[
            `Expected peak ${demoPeakPressure.expectedLoadMW} MW at ${demoPeakPressure.expectedPeakHour}`,
            `Most affected: ${demoPeakPressure.affectedRegion}`,
            "Reduce evening peak pressure by 12%",
          ]}
          expectedSavingDZD={320000}
          risk={demoPeakPressure.level}
          confidence={88}
          onDecision={(decision) => setDecisions((current) => [decision, ...current].slice(0, 10))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-up stagger-3 space-y-6">
          <ActionCenter />
          <AnomalyDetectionPanel />
        </div>
        <div className="animate-fade-up stagger-4 space-y-6">
          <OperatorDecisionLog decisions={decisions} />
          <OperatorNotes />
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${tone}`}>
      <Icon size={18} />
      <div>
        <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
