"use client";
import { demoAssetHealth } from "@/lib/dashboard/demoOperationalData";

export function AssetHealthMonitor() {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <h2 className="text-sm font-semibold">Asset Health Monitor</h2>
      <div className="mt-4 space-y-3">
        {demoAssetHealth.map((asset) => (
          <div key={asset.name}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="font-medium">{asset.name}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${assetClass(asset.status)}`}>{asset.value}</span>
            </div>
            {asset.percent !== undefined && <div className="h-2 rounded-full bg-[var(--bg-secondary)]"><div className="h-full rounded-full bg-grid-500" style={{ width: `${asset.percent}%` }} /></div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function assetClass(status: string) {
  if (status === "Critical" || status === "Offline") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (status === "Warning") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}
