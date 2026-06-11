export type RealityMode = "demo" | "pilot" | "future" | "live";

const labels: Record<RealityMode, string> = {
  demo: "Demo Mode - Simulated Data",
  pilot: "Pilot Ready - Connector Not Active",
  future: "Future Module - Regulation Dependent",
  live: "Live API - Connected",
};

const classes: Record<RealityMode, string> = {
  demo: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  pilot: "border-grid-500/30 bg-grid-500/10 text-grid-500",
  future: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  live: "border-green-500/30 bg-green-500/10 text-green-500",
};

export function RealityModeBadge({ mode = "demo" }: { mode?: RealityMode }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[mode]}`}>{labels[mode]}</span>;
}
