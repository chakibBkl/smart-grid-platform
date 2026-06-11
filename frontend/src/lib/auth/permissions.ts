import type { AuthSession } from "./demoUsers";

export function canAccessNationalDashboard(session: AuthSession | null): boolean {
  return session?.role === "national_admin" || session?.role === "national_operator";
}

export function canAccessRegionDashboard(session: AuthSession | null, regionId: string): boolean {
  if (!session) return false;
  return Boolean(session.regionId && session.regionId === regionId);
}

export function canAccessMarketIntelligence(session: AuthSession | null): boolean {
  return session?.role === "national_admin" || session?.role === "national_operator";
}

export function canManageRegions(session: AuthSession | null): boolean {
  return session?.role === "national_admin";
}

export function canApproveAction(session: AuthSession | null, scope: "national" | "regional", regionId?: string): boolean {
  if (!session) return false;
  if (session.role === "national_admin") return true;
  if (scope === "national") return session.role === "national_operator";
  if (session.role === "regional_admin" || session.role === "regional_operator") return session.regionId === regionId;
  return false;
}

export function canEditRegionalSettings(session: AuthSession | null, regionId: string): boolean {
  return false;
}

export function canAccessSettings(session: AuthSession | null): boolean {
  return session?.role === "national_admin";
}

export function isReadOnly(session: AuthSession | null): boolean {
  return !session || session.role === "viewer" || session.role === "analyst";
}
