"use client";
import { useEffect, useState } from "react";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";
import { getRegionStatus, setRegionStatus, type RegionOperationalStatus } from "@/lib/auth/regionStatus";
import { canManageRegions } from "@/lib/auth/permissions";
import type { AuthSession } from "@/lib/auth/demoUsers";

const adminMap: Record<string, string> = {
  "hassi-messaoud": "hassi_admin",
  arzew: "arzew_admin",
  "hassi-rmel": "hassi_rmel_admin",
  skikda: "skikda_admin",
  adrar: "adrar_admin",
  ghardaia: "ghardaia_admin",
  biskra: "biskra_admin",
  algiers: "algiers_admin",
  "setif-bba": "setif_bba_admin",
  annaba: "annaba_admin",
  tamanrasset: "tamanrasset_admin",
  "bechar-tindouf": "bechar_tindouf_admin",
};

export function NationalRegionControlPanel({ session }: { session: AuthSession | null }) {
  const [statuses, setStatuses] = useState<Record<string, RegionOperationalStatus>>({});
  const canManage = canManageRegions(session);

  useEffect(() => {
    const next: Record<string, RegionOperationalStatus> = {};
    demoRegionalEnergyData.forEach((region) => {
      next[region.id] = getRegionStatus(region.id, region.riskLevel);
    });
    setStatuses(next);
  }, []);

  function update(regionId: string, status: RegionOperationalStatus) {
    setRegionStatus(regionId, status);
    setStatuses((current) => ({ ...current, [regionId]: status }));
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">National Region Control Panel</h2>
          <p className="text-xs text-[var(--text-secondary)]">National Admin can control regional dashboard status without entering independent regional dashboards.</p>
        </div>
        {!canManage && <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-500">View only</span>}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="text-[var(--text-secondary)]">
            <tr>
              <th className="py-2">Region</th>
              <th className="py-2">Status</th>
              <th className="py-2">Admin</th>
              <th className="py-2">Users</th>
              <th className="py-2">Health</th>
              <th className="py-2">Risk</th>
              <th className="py-2">Last update</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoRegionalEnergyData.map((region, index) => (
              <tr key={region.id} className="border-t border-[var(--border)]">
                <td className="py-3 font-semibold">{region.name}</td>
                <td className="py-3"><span className={`rounded-full border px-2 py-0.5 font-semibold ${statusClass(statuses[region.id])}`}>{statuses[region.id] || "Active"}</span></td>
                <td className="py-3 text-[var(--text-secondary)]">{adminMap[region.id] || `${region.id}_admin`}</td>
                <td className="py-3 text-[var(--text-secondary)]">{index % 3 + 2}</td>
                <td className="py-3">{region.gridHealth}%</td>
                <td className="py-3"><span className={`rounded-full border px-2 py-0.5 ${riskBadgeClass(region.riskLevel)}`}>{region.riskLevel}</span></td>
                <td className="py-3 text-[var(--text-secondary)]">03:{(20 + index).toString().padStart(2, "0")}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button disabled={!canManage} onClick={() => update(region.id, statuses[region.id] === "Disabled" ? "Active" : "Disabled")} className="rounded-lg border border-[var(--border)] px-2 py-1 font-semibold disabled:opacity-40">
                      {statuses[region.id] === "Disabled" ? "Enable" : "Disable"}
                    </button>
                    <button disabled={!canManage} onClick={() => update(region.id, "Maintenance")} className="rounded-lg border border-[var(--border)] px-2 py-1 font-semibold disabled:opacity-40">Maintenance</button>
                    <button disabled={!canManage} className="rounded-lg border border-[var(--border)] px-2 py-1 font-semibold disabled:opacity-40">Reset Demo Password</button>
                    <button className="rounded-lg border border-[var(--border)] px-2 py-1 font-semibold">View Logs</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function statusClass(status?: RegionOperationalStatus) {
  if (status === "Disabled") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (status === "Maintenance") return "border-blue-500/30 bg-blue-500/10 text-blue-500";
  if (status === "Warning") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}
