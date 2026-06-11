import { SELECTED_REGION_KEY, SELECTED_SCOPE_KEY } from "@/lib/dashboard/scope";
import { demoUsers, type AuthSession, type DemoUser } from "./demoUsers";

export const AUTH_SESSION_KEY = "authSession";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function loginDemoUser(username: string, password: string, requestedScope: string): AuthSession | null {
  const user = demoUsers.find((item) => item.username === username && item.password === password);
  if (!user) return null;
  if (!scopeMatches(user, requestedScope)) return null;

  const session: AuthSession = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    scope: user.scope,
    regionId: user.regionId,
    permissions: buildPermissions(user),
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(SELECTED_SCOPE_KEY, user.scope);
  if (user.regionId) localStorage.setItem(SELECTED_REGION_KEY, user.regionId);
  else localStorage.removeItem(SELECTED_REGION_KEY);
  return session;
}

export function logout() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(SELECTED_SCOPE_KEY);
  localStorage.removeItem(SELECTED_REGION_KEY);
}

function scopeMatches(user: DemoUser, requestedScope: string) {
  if (user.scope === "national") return requestedScope === "national";
  return requestedScope === user.regionId;
}

function buildPermissions(user: DemoUser) {
  const common = ["view_reports"];
  if (user.role === "national_admin") return [...common, "access_national", "access_all_regions", "access_market", "manage_regions", "approve_actions", "manage_users", "settings"];
  if (user.role === "national_operator") return [...common, "access_national", "access_all_regions", "access_market", "approve_actions"];
  if (user.role === "regional_admin") return [...common, "access_assigned_region", "approve_actions", "write_notes", "regional_settings"];
  if (user.role === "regional_operator") return [...common, "access_assigned_region", "approve_actions", "write_notes"];
  if (user.role === "analyst") return [...common, "read_dashboards"];
  return ["view_reports"];
}
