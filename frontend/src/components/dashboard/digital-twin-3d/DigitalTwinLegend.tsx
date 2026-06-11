import { DeviceStatusBadge } from "./DeviceStatusBadge";

export function DigitalTwinLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <DeviceStatusBadge status="Normal" />
      <DeviceStatusBadge status="Warning" />
      <DeviceStatusBadge status="Critical" />
      <DeviceStatusBadge status="Offline" />
      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 font-semibold text-cyan-400">Cyan = Data flow</span>
      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 font-semibold text-yellow-500">Yellow/Blue = Energy flow</span>
    </div>
  );
}
