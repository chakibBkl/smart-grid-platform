export type DashboardScope = "national" | "regional";

export const SELECTED_SCOPE_KEY = "selectedDashboardScope";
export const SELECTED_REGION_KEY = "selectedRegionId";

export function getStoredScope() {
  if (typeof window === "undefined") return { scope: null as DashboardScope | null, regionId: null as string | null };
  return {
    scope: localStorage.getItem(SELECTED_SCOPE_KEY) as DashboardScope | null,
    regionId: localStorage.getItem(SELECTED_REGION_KEY),
  };
}

export function setNationalScope() {
  localStorage.setItem(SELECTED_SCOPE_KEY, "national");
  localStorage.removeItem(SELECTED_REGION_KEY);
}

export function setRegionalScope(regionId: string) {
  localStorage.setItem(SELECTED_SCOPE_KEY, "regional");
  localStorage.setItem(SELECTED_REGION_KEY, regionId);
}
