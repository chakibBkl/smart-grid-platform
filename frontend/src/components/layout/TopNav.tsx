"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, Bell, User, Clock3 } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useWebSocket } from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";
import { demoNotifications, notificationClass } from "@/lib/dashboard/demoNotifications";
import { getAuthSession, logout } from "@/lib/auth/session";
import { getRoleLabel, type AuthSession } from "@/lib/auth/demoUsers";
import { usePathname, useRouter } from "next/navigation";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { getStoredScope } from "@/lib/dashboard/scope";

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useWebSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [dashboardLabel, setDashboardLabel] = useState("Guest");
  const [now, setNow] = useState<Date | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = demoNotifications.filter((item) => !readIds.includes(item.id)).length;
  const connected = Boolean(session) || isConnected;

  useEffect(() => {
    const saved = localStorage.getItem("nv-team-read-notifications");
    if (saved) setReadIds(JSON.parse(saved) as string[]);
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const activeSession = getAuthSession();
    setSession(activeSession);
    setDashboardLabel(getDashboardLabel(pathname, activeSession));
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    const ids = demoNotifications.map((item) => item.id);
    setReadIds(ids);
    localStorage.setItem("nv-team-read-notifications", JSON.stringify(ids));
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="relative z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)]/85 px-4 backdrop-blur-xl md:px-6">
      {/* gradient hairline under the header */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-grid-500/50 to-transparent" />
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            {connected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", connected ? "bg-green-500" : "bg-red-500")} />
          </span>
          <span className="text-xs font-medium text-[var(--text-secondary)]">{connected ? "Live" : "Disconnected"}</span>
        </div>
        <div className="hidden items-center gap-2 text-xs text-[var(--text-secondary)] md:flex">
          <Clock3 size={14} />
          <span>{now ? now.toLocaleString() : "Loading time"}</span>
        </div>
        <div className="hidden sm:block">
          <RealityModeBadge />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-[var(--text-secondary)] transition-all duration-300 hover:rotate-12 hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((value) => !value)}
            className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="animate-scale-in absolute right-0 top-11 z-50 w-[360px] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-2xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Notifications</h2>
                  <p className="text-xs text-[var(--text-secondary)]">{unreadCount} unread operational alerts</p>
                </div>
                <button onClick={markAllRead} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold">
                  Mark read
                </button>
              </div>
              <div className="max-h-[360px] space-y-2 overflow-y-auto">
                {demoNotifications.map((item) => (
                  <Link
                    key={item.id}
                    href={notificationHref(item.source)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg border border-[var(--border)] p-3 hover:border-grid-500/40",
                      readIds.includes(item.id) ? "opacity-70" : "bg-[var(--bg-secondary)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.message}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${notificationClass(item.severity)}`}>{item.severity}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-[var(--text-secondary)]">{item.source} - {item.time}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setUserOpen((value) => !value)} className="flex items-center gap-2 p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
            <User size={18} />
            <span className="text-sm hidden md:block">{dashboardLabel}</span>
          </button>
          {userOpen && (
            <div className="animate-scale-in absolute right-0 top-11 z-50 w-64 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-2xl">
              <p className="text-sm font-semibold">{dashboardLabel}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Account: {session?.displayName || "Not logged in"}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{session ? getRoleLabel(session.role) : "Guest"}</p>
              <div className="mt-3 grid gap-2">
                <button onClick={handleLogout} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-xs font-semibold text-red-500">Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function notificationHref(source: string) {
  if (source === "Optimization") return "/optimization";
  if (source === "Renewables") return "/renewables";
  if (source === "Reports") return "/reports";
  return "/executive";
}

function getDashboardLabel(pathname: string, session: AuthSession | null) {
  if (!session) return "Guest";
  if (pathname === "/login") return "Login";
  if (pathname.startsWith("/dashboard/regions/")) {
    const regionId = pathname.split("/").filter(Boolean).at(-1);
    const region = demoRegionalEnergyData.find((item) => item.id === regionId);
    return region ? `${region.name} Dashboard` : "Regional Dashboard";
  }
  if (pathname.startsWith("/dashboard/national")) return "National Dashboard";
  if (pathname.startsWith("/digital-twin")) {
    const regionId = session.regionId || getStoredScope().regionId;
    const region = demoRegionalEnergyData.find((item) => item.id === regionId);
    return region ? `${region.name} Digital Twin` : "3D Digital Twin";
  }
  if (pathname.startsWith("/settings")) {
    const { scope, regionId } = getStoredScope();
    if (scope === "regional" && regionId) {
      const region = demoRegionalEnergyData.find((item) => item.id === regionId);
      return region ? `${region.name} Settings` : "Regional Settings";
    }
    return "National Settings";
  }
  if (pathname.startsWith("/geo-intelligence")) return "Geo Intelligence";
  if (pathname.startsWith("/market")) return "Market Simulation";
  if (pathname.startsWith("/reports")) return "Reports";
  if (pathname.startsWith("/assistant")) return "Decision Explanation";
  if (pathname.startsWith("/select-region")) return "Select Dashboard";
  const { scope, regionId } = getStoredScope();
  if (scope === "regional" && regionId) {
    const region = demoRegionalEnergyData.find((item) => item.id === regionId);
    return region ? `${region.name} Dashboard` : "Regional Dashboard";
  }
  return session.displayName;
}
