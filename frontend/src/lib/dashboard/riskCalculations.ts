export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface RiskAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendedAction: string;
  timestamp: string;
}

export function severityClass(severity: AlertSeverity) {
  if (severity === "critical") return "border-red-500/40 bg-red-500/10 text-red-500";
  if (severity === "high") return "border-orange-500/40 bg-orange-500/10 text-orange-500";
  if (severity === "medium") return "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
  return "border-green-500/40 bg-green-500/10 text-green-500";
}

export function riskBadgeClass(risk: string) {
  if (risk === "Critical" || risk === "High") return "bg-red-500/10 text-red-500 border-red-500/30";
  if (risk === "Medium-High") return "bg-orange-500/10 text-orange-500 border-orange-500/30";
  if (risk === "Medium") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
  return "bg-green-500/10 text-green-500 border-green-500/30";
}
