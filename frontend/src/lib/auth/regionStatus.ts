import type { RegionalRiskLevel } from "@/lib/dashboard/demoRegionalEnergyData";

export type RegionOperationalStatus = "Active" | "Warning" | "Maintenance" | "Disabled";

export function getRegionStatus(regionId: string, risk?: RegionalRiskLevel): RegionOperationalStatus {
  if (typeof window === "undefined") return riskToStatus(risk);
  const saved = localStorage.getItem(`regionStatus:${regionId}`) as RegionOperationalStatus | null;
  return saved || riskToStatus(risk);
}

export function setRegionStatus(regionId: string, status: RegionOperationalStatus) {
  localStorage.setItem(`regionStatus:${regionId}`, status);
}

function riskToStatus(risk?: RegionalRiskLevel): RegionOperationalStatus {
  if (risk === "High" || risk === "Medium-High") return "Warning";
  return "Active";
}
