"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe2, MapPin } from "lucide-react";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";
import { setNationalScope, setRegionalScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/demoUsers";
import { canAccessNationalDashboard } from "@/lib/auth/permissions";

export default function SelectRegionPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const canChooseNational = canAccessNationalDashboard(session);
  const visibleRegions = session?.scope === "regional" && session.regionId
    ? demoRegionalEnergyData.filter((region) => region.id === session.regionId)
    : [];

  useEffect(() => {
    const activeSession = getAuthSession();
    if (!activeSession) {
      router.replace("/login");
      return;
    }
    setSession(activeSession);
  }, [router]);

  function openNational() {
    if (!canChooseNational) return;
    setNationalScope();
    router.push("/dashboard/national");
  }

  function openRegion(regionId: string) {
    if (session?.scope !== "regional" || session.regionId !== regionId) return;
    setRegionalScope(regionId);
    router.push(`/dashboard/regions/${regionId}`);
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h1 className="text-2xl font-bold">Select Operational Scope</h1>
        <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
          Dashboard access is independent. National users enter only the National Control Center; regional users enter only their assigned regional dashboard.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <button disabled={!canChooseNational} onClick={openNational} className="rounded-xl border border-grid-500/30 bg-grid-500/10 p-5 text-left transition hover:border-grid-500 disabled:cursor-not-allowed disabled:opacity-50">
          <div className="flex items-center gap-3">
            <Globe2 className="text-grid-500" size={28} />
            <div>
              <h2 className="text-xl font-bold">National Dashboard</h2>
              <p className="text-xs font-semibold text-grid-500">Strategic control center</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)]">
            <p>National overview, regional status control, Geo Intelligence, Market Intelligence, and strategic recommendations. National access does not enter regional dashboards.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {["All regions", "Market enabled", "Status control", "No regional entry"].map((item) => (
                <span key={item} className="rounded-lg bg-[var(--bg-card)] p-3 text-xs font-semibold">{item}</span>
              ))}
            </div>
          </div>
        </button>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-3">
            <MapPin className="text-grid-500" size={25} />
            <div>
              <h2 className="text-xl font-bold">Regional Dashboard</h2>
              <p className="text-xs text-[var(--text-secondary)]">Local operations only. Market Intelligence is not available.</p>
            </div>
          </div>
          <div className="mt-5 grid max-h-[620px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {visibleRegions.length === 0 && (
              <p className="rounded-lg bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-secondary)] sm:col-span-2">
                No regional dashboard is available for this account. Regional dashboards require their own regional login.
              </p>
            )}
            {visibleRegions.map((region) => (
              <button key={region.id} onClick={() => openRegion(region.id)} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-left transition hover:border-grid-500/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{region.name}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">{region.wilaya}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskBadgeClass(region.riskLevel)}`}>{region.riskLevel}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">{region.energyRole}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <span>Health {region.gridHealth}%</span>
                  <span>Solar {region.solarPotential}%</span>
                  <span>Wind {region.windPotential}%</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
