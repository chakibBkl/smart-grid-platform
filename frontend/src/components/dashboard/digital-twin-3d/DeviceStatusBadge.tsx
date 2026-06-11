import type { DeviceStatus } from "@/lib/dashboard/deviceTypes";

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  return <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(status)}`}>{status}</span>;
}

export function statusClass(status: DeviceStatus) {
  if (status === "Critical") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (status === "Warning") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-600";
  if (status === "Offline") return "border-slate-500/30 bg-slate-500/10 text-slate-500";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}

export function statusColor(status: DeviceStatus) {
  if (status === "Critical") return "#ef4444";
  if (status === "Warning") return "#f59e0b";
  if (status === "Offline") return "#64748b";
  return "#22c55e";
}
