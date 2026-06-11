export type UserRole =
  | "national_admin"
  | "national_operator"
  | "regional_admin"
  | "regional_operator"
  | "analyst"
  | "viewer";

export interface DemoUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  scope: "national" | "regional";
  regionId: string | null;
  displayName: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  scope: "national" | "regional";
  regionId?: string | null;
  permissions: string[];
  loginTime: string;
}

export const demoUsers: DemoUser[] = [
  { id: "user-national-admin", username: "national_admin", password: "demo123", role: "national_admin", scope: "national", regionId: null, displayName: "National Admin" },
  { id: "user-national-operator", username: "national_operator", password: "demo123", role: "national_operator", scope: "national", regionId: null, displayName: "National Operator" },
  { id: "user-hassi-admin", username: "hassi_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "hassi-messaoud", displayName: "Hassi Messaoud Regional Admin" },
  { id: "user-arzew-admin", username: "arzew_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "arzew", displayName: "Arzew Regional Admin" },
  { id: "user-hassi-rmel-admin", username: "hassi_rmel_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "hassi-rmel", displayName: "Hassi R'Mel Regional Admin" },
  { id: "user-skikda-admin", username: "skikda_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "skikda", displayName: "Skikda Regional Admin" },
  { id: "user-adrar-admin", username: "adrar_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "adrar", displayName: "Adrar Regional Admin" },
  { id: "user-ghardaia-admin", username: "ghardaia_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "ghardaia", displayName: "Ghardaia Regional Admin" },
  { id: "user-biskra-admin", username: "biskra_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "biskra", displayName: "Biskra Regional Admin" },
  { id: "user-algiers-admin", username: "algiers_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "algiers", displayName: "Algiers Regional Admin" },
  { id: "user-setif-bba-admin", username: "setif_bba_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "setif-bba", displayName: "Setif / BBA Regional Admin" },
  { id: "user-annaba-admin", username: "annaba_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "annaba", displayName: "Annaba Regional Admin" },
  { id: "user-tamanrasset-admin", username: "tamanrasset_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "tamanrasset", displayName: "Tamanrasset Regional Admin" },
  { id: "user-bechar-tindouf-admin", username: "bechar_tindouf_admin", password: "demo123", role: "regional_admin", scope: "regional", regionId: "bechar-tindouf", displayName: "Bechar / Tindouf Regional Admin" },
  { id: "user-arzew-operator", username: "arzew_operator", password: "demo123", role: "regional_operator", scope: "regional", regionId: "arzew", displayName: "Arzew Regional Operator" },
  { id: "user-hassi-operator", username: "hassi_operator", password: "demo123", role: "regional_operator", scope: "regional", regionId: "hassi-messaoud", displayName: "Hassi Messaoud Regional Operator" },
  { id: "user-algiers-operator", username: "algiers_operator", password: "demo123", role: "regional_operator", scope: "regional", regionId: "algiers", displayName: "Algiers Regional Operator" },
  { id: "user-analyst", username: "analyst", password: "demo123", role: "analyst", scope: "national", regionId: null, displayName: "Demo Analyst" },
  { id: "user-viewer", username: "viewer", password: "demo123", role: "viewer", scope: "national", regionId: null, displayName: "Demo Viewer" },
];

export function getRoleLabel(role: UserRole) {
  return role.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
