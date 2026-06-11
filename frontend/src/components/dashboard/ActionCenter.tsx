"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { demoActions, type OperationalAction, type OperationalStatus } from "@/lib/dashboard/demoOperationalData";
import { getAuthSession } from "@/lib/auth/session";
import { canApproveAction } from "@/lib/auth/permissions";
import { getStoredScope, type DashboardScope } from "@/lib/dashboard/scope";
import type { AuthSession } from "@/lib/auth/demoUsers";

export function ActionCenter() {
  const [actions, setActions] = useState<OperationalAction[]>(demoActions);
  const [canApprove, setCanApprove] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [scope, setScope] = useState<DashboardScope>("national");
  const [regionId, setRegionId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nv-team-action-center");
    if (saved) setActions(JSON.parse(saved) as OperationalAction[]);
    const activeSession = getAuthSession();
    const stored = getStoredScope();
    setSession(activeSession);
    setScope(stored.scope || "national");
    setRegionId(stored.regionId);
    setCanApprove(canApproveAction(activeSession, stored.scope || "national", stored.regionId || undefined));
  }, []);

  function updateStatus(id: string, status: OperationalStatus) {
    setActions((current) => {
      const next = current.map((action) => action.id === id ? { ...action, status } : action);
      localStorage.setItem("nv-team-action-center", JSON.stringify(next));
      const action = current.find((item) => item.id === id);
      if (action) writeDecisionLog(action, status, scope, regionId, session);
      return next;
    });
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Action Center</h2>
          <p className="text-xs text-[var(--text-secondary)]">Operator-reviewed actions generated from demo risk logic.</p>
        </div>
        <ClipboardCheck className="text-grid-500" size={20} />
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.id} className="rounded-lg border border-[var(--border)] p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityClass(action.priority)}`}>{action.priority}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(action.status)}`}>{action.status}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold">{action.title}</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{action.description}</p>
                <p className="mt-2 text-xs font-medium text-grid-500">{action.recommendedAction}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Deadline {action.deadline} - {action.expectedImpact}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button disabled={!canApprove} onClick={() => updateStatus(action.id, "Approved")} className="rounded-lg bg-grid-500 p-2 text-white disabled:opacity-40" title="Approve action"><CheckCircle2 size={16} /></button>
                <button disabled={!canApprove} onClick={() => updateStatus(action.id, "Rejected")} className="rounded-lg border border-[var(--border)] p-2 text-red-500 disabled:opacity-40" title="Reject action"><XCircle size={16} /></button>
              </div>
            </div>
            {!canApprove && <p className="mt-2 text-xs text-red-500">You do not have permission to approve operational actions.</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function writeDecisionLog(action: OperationalAction, status: OperationalStatus, scope: DashboardScope, regionId: string | null, session: AuthSession | null) {
  const key = scope === "regional" && regionId ? `decisionLog:region:${regionId}` : "decisionLog:national";
  const raw = localStorage.getItem(key);
  const current = raw ? JSON.parse(raw) as Array<Record<string, string>> : [];
  const next = [
    {
      id: `${action.id}-${Date.now()}`,
      actionId: action.id,
      title: action.title,
      status,
      user: session?.username || "unknown",
      role: session?.role || "unknown",
      scope,
      regionId: regionId || "",
      timestamp: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 25);
  localStorage.setItem(key, JSON.stringify(next));
}

function priorityClass(priority: string) {
  if (priority === "Critical") return "border-red-500/40 bg-red-500/10 text-red-500";
  if (priority === "High") return "border-orange-500/40 bg-orange-500/10 text-orange-500";
  if (priority === "Medium") return "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
  return "border-green-500/40 bg-green-500/10 text-green-500";
}

function statusClass(status: string) {
  if (status === "Approved" || status === "Resolved") return "border-green-500/40 bg-green-500/10 text-green-500";
  if (status === "Rejected") return "border-red-500/40 bg-red-500/10 text-red-500";
  return "border-blue-500/40 bg-blue-500/10 text-blue-500";
}
