"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Bot,
  Map,
  SlidersHorizontal,
  Leaf,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { getStoredScope, type DashboardScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import type { AuthSession } from "@/lib/auth/demoUsers";

const nationalItems = [
  { href: "/dashboard/national", label: "National Dashboard", icon: LayoutDashboard },
  { href: "/geo-intelligence", label: "Geo Intelligence", icon: Map },
  { href: "/forecast", label: "Forecasting", icon: TrendingUp },
  { href: "/optimization", label: "Optimization", icon: SlidersHorizontal },
  { href: "/market", label: "Market Intelligence", icon: BarChart3 },
  { href: "/assistant", label: "Decision Explanation", icon: Bot },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const regionalItems = [
  { href: "/dashboard", label: "Regional Dashboard", icon: LayoutDashboard },
  { href: "/digital-twin", label: "3D Digital Twin", icon: Boxes },
  { href: "/forecast", label: "Forecasting", icon: TrendingUp },
  { href: "/optimization", label: "Optimization", icon: SlidersHorizontal },
  { href: "/renewables", label: "Assets", icon: Leaf },
  { href: "/executive", label: "Actions", icon: LayoutDashboard },
  { href: "/assistant", label: "Decision Explanation", icon: Bot },
  { href: "/reports", label: "Reports", icon: FileText },
];

type NavItem = typeof nationalItems[number];

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [scope, setScope] = useState<DashboardScope | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const stored = getStoredScope();
    setScope(stored.scope);
    setRegionId(stored.regionId);
    setSession(getAuthSession());
  }, [pathname]);

  const isRegionalPath = pathname.startsWith("/dashboard/regions");
  const activeScope = isRegionalPath || session?.scope === "regional" || scope === "regional" ? "regional" : "national";
  const navItems = filterByRole(
    activeScope === "regional"
    ? regionalItems.map((item) => item.href === "/dashboard" && regionId ? { ...item, href: `/dashboard/regions/${regionId}` } : item)
    : nationalItems,
    session
  );

  return (
    <aside
      className={cn(
        "bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col transition-all duration-300",
        open ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-4">
        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-xl bg-grid-500/20 blur-md" />
          <Image src="/brand/neuro-grid-logo.png" alt="Neuro Grid" width={36} height={36} className="relative h-9 w-9 object-contain" priority />
        </div>
        {open && (
          <div className="min-w-0 animate-fade-in">
            <span className="text-gradient block truncate text-lg font-extrabold tracking-tight">NEURO GRID</span>
            <span className="block text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">Smart Grid Platform</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group animate-fade-up relative mx-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                isActive
                  ? "border border-grid-500/25 bg-gradient-to-r from-grid-500/15 to-grid-500/5 text-grid-500 shadow-[0_0_18px_rgba(34,197,94,.08)]"
                  : "text-[var(--text-secondary)] hover:translate-x-1 hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              )}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-grid-500 shadow-[0_0_10px_rgba(34,197,94,.6)]" />}
              <Icon size={20} className={cn("shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
              {open && <span className="truncate text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="p-4 border-t border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
}

function filterByRole(items: NavItem[], session: AuthSession | null) {
  if (!session) return [];
  if (session.role === "viewer") return items.filter((item) => item.href.includes("dashboard") || item.href === "/reports");
  if (session.role === "analyst") return items.filter((item) => !["/settings", "/market", "/dashboard/national"].includes(item.href));
  if (session.role === "regional_operator") return items.filter((item) => item.href !== "/dashboard/national");
  if (session.role === "regional_admin") return items.filter((item) => item.href !== "/dashboard/national");
  if (session.role === "national_operator") return items.filter((item) => item.href !== "/settings");
  return items;
}
