"use client";
import { demoEnergyBalance } from "@/lib/dashboard/demoOperationalData";

export function EnergyBalancePanel() {
  const totalSupply = demoEnergyBalance.solarMW + demoEnergyBalance.windMW + demoEnergyBalance.batteryMW + demoEnergyBalance.conventionalSupportMW;
  const reserveMargin = ((totalSupply - demoEnergyBalance.demandMW) / demoEnergyBalance.demandMW) * 100;
  const status = reserveMargin < 0 ? "Deficit" : reserveMargin <= 5 ? "Tight" : reserveMargin <= 12 ? "Balanced" : "Surplus";
  const supplyRows = [
    ["Solar", demoEnergyBalance.solarMW, "bg-yellow-500"],
    ["Wind", demoEnergyBalance.windMW, "bg-blue-500"],
    ["Battery", demoEnergyBalance.batteryMW, "bg-green-500"],
    ["Conventional", demoEnergyBalance.conventionalSupportMW, "bg-orange-500"],
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Energy Balance</h2>
          <p className="text-xs text-[var(--text-secondary)]">Supply coverage against current demand.</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Total Demand" value={`${demoEnergyBalance.demandMW} MW`} />
        <Metric label="Total Supply" value={`${totalSupply} MW`} />
        <Metric label="Reserve Margin" value={`${reserveMargin.toFixed(1)}%`} />
        <Metric label="Conventional Support" value={`${demoEnergyBalance.conventionalSupportMW} MW`} />
      </div>
      <div className="mt-4 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
        <div className="flex h-3">
          {supplyRows.map(([label, value, color]) => (
            <div key={label} className={`${color}`} style={{ width: `${(Number(value) / totalSupply) * 100}%` }} title={`${label}: ${value} MW`} />
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
        {supplyRows.map(([label, value, color]) => (
          <div key={label} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${color}`} />{label}: {value} MW</div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--bg-secondary)] p-3"><p className="text-[11px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}

function statusClass(status: string) {
  if (status === "Deficit") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (status === "Tight") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}
