"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Database, Lock, RotateCcw, Settings, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { DemoAssumptionsPanel } from "@/components/dashboard/reality/DemoAssumptionsPanel";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { getAuthSession } from "@/lib/auth/session";
import { canAccessSettings, canManageRegions } from "@/lib/auth/permissions";
import { getRegionStatus, setRegionStatus, type RegionOperationalStatus } from "@/lib/auth/regionStatus";
import { getRoleLabel, type AuthSession } from "@/lib/auth/demoUsers";
import { demoRegionalProvenance, formatConfidence } from "@/lib/reality/dataProvenance";

const resetKeys = ["nv-team-action-center", "nv-team-read-notifications", "selectedDashboardScope", "selectedRegionId"];

export default function SettingsPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, RegionOperationalStatus>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activeSession = getAuthSession();
    setSession(activeSession);
    setBlocked(!canAccessSettings(activeSession));
    const next: Record<string, RegionOperationalStatus> = {};
    visibleRegions(activeSession).forEach((region) => {
      next[region.id] = getRegionStatus(region.id, region.riskLevel);
    });
    setStatuses(next);
  }, []);

  const regions = useMemo(() => visibleRegions(session), [session]);
  const nationalAdmin = canManageRegions(session);
  const regionalSettings = session?.scope === "regional";
  const selectedRegion = regionalSettings ? demoRegionalEnergyData.find((region) => region.id === session?.regionId) : null;
  const settingsTitle = regionalSettings && selectedRegion ? `${selectedRegion.name} Regional Settings` : "National Settings";

  if (blocked) {
    return (
      <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-2xl font-bold text-red-500">Settings unavailable</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Settings are available only to National Admin or assigned Regional Admin users.</p>
        <Link href="/login" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Login with admin access</Link>
      </section>
    );
  }

  function updateRegion(regionId: string, status: RegionOperationalStatus) {
    if (!nationalAdmin && session?.regionId !== regionId) return;
    setRegionStatus(regionId, status);
    setStatuses((current) => ({ ...current, [regionId]: status }));
    setMessage(`Saved ${status} status for ${demoRegionalEnergyData.find((region) => region.id === regionId)?.name || regionId}.`);
  }

  function resetDemoState() {
    resetKeys.forEach((key) => localStorage.removeItem(key));
    demoRegionalEnergyData.forEach((region) => localStorage.removeItem(`operatorNotes:region:${region.id}`));
    localStorage.removeItem("operatorNotes:national");
    setMessage("Demo notifications, actions, and operator notes were reset. Authentication remains active.");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{settingsTitle}</h1>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              {regionalSettings
                ? "Manage local regional dashboard settings, local data reality status, regional notes, and safe demo controls."
                : "Manage national demo access, all-region dashboard status, data reality labels, and safe reset tools for the competition environment."}
            </p>
          </div>
          <RealityModeBadge />
        </div>
      </header>

      {message && <p className="rounded-xl border border-grid-500/30 bg-grid-500/10 p-3 text-sm font-medium text-grid-500">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-grid-500" size={20} />
            <h2 className="text-sm font-semibold">Access Profile</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <Info label="User" value={session?.displayName || "Admin"} />
            <Info label="Role" value={session ? getRoleLabel(session.role) : "Loading"} />
            <Info label="Settings Level" value={regionalSettings ? "Regional Settings" : "National Settings"} />
            <Info label="Region" value={selectedRegion?.name || "All regions"} />
            <Info label="Market Intelligence" value={session?.scope === "national" ? "National simulation enabled" : "Disabled for regional scope"} />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2">
            <Database className="text-grid-500" size={20} />
            <h2 className="text-sm font-semibold">{regionalSettings ? "Regional Data Reality" : "National Data Reality"}</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Info label="Source Mode" value={demoRegionalProvenance.sourceMode} />
            <Info label="Confidence" value={formatConfidence(demoRegionalProvenance)} />
            <Info label="Live API" value={demoRegionalProvenance.isRealTime ? "Connected" : "Not connected"} />
          </div>
          <p className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">
            {demoRegionalProvenance.notes} Settings cannot switch to live mode until validated backend connectors are active.
          </p>
          <TraceabilityDetails metric="dataQuality" />
        </section>
      </div>

      <DemoAssumptionsPanel />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-grid-500" size={20} />
            <div>
              <h2 className="text-sm font-semibold">Regional Dashboard Status</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {nationalAdmin ? "National Admin can manage all regional dashboards." : "Regional Admin can manage only their assigned region."}
              </p>
            </div>
          </div>
          {!nationalAdmin && <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-600">Regional scope</span>}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {regions.map((region) => (
            <div key={region.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{region.name}</h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Health {region.gridHealth}% - Risk {region.riskLevel} - Data quality {region.dataQuality}%</p>
                </div>
                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(statuses[region.id])}`}>{statuses[region.id] || "Active"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["Active", "Maintenance", "Disabled"] as RegionOperationalStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateRegion(region.id, status)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold hover:border-grid-500"
                  >
                    {status}
                  </button>
                ))}
                <span className="rounded-lg bg-grid-500/10 px-3 py-2 text-xs font-semibold text-grid-500">Control only</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <ActionCard icon={Users} title={regionalSettings ? "Regional Users" : "National Demo Users"} text={regionalSettings ? "Regional demo access is limited to the assigned region. Production requires backend authentication and regional role policies." : "National demo users are stored in frontend demo mode only. Production requires backend authentication, hashed passwords, and role policies."} />
        <ActionCard icon={Lock} title={regionalSettings ? "Regional Security Mode" : "National Security Mode"} text="No secrets, real API keys, or local database files are exposed from Settings. Live connectors remain disabled in demo mode." />
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2">
            <RotateCcw className="text-grid-500" size={20} />
            <h2 className="text-sm font-semibold">Demo Reset</h2>
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Clear demo actions, notes, and notification read state without logging out.</p>
          <button onClick={resetDemoState} className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500">Reset Demo State</button>
        </section>
      </div>
    </div>
  );
}

function visibleRegions(session: AuthSession | null) {
  if (session?.scope === "regional" && session.regionId) return demoRegionalEnergyData.filter((region) => region.id === session.regionId);
  return demoRegionalEnergyData;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
      <p className="text-[11px] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ActionCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <div className="flex items-center gap-2">
        <Icon className="text-grid-500" size={20} />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{text}</p>
    </section>
  );
}

function statusClass(status?: RegionOperationalStatus) {
  if (status === "Disabled") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (status === "Maintenance") return "border-blue-500/30 bg-blue-500/10 text-blue-500";
  if (status === "Warning") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-600";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}
