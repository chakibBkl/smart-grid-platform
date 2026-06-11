"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Globe2, KeyRound, Lock, Moon, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { loginDemoUser } from "@/lib/auth/session";
import { demoUsers, type DemoUser } from "@/lib/auth/demoUsers";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("national_admin");
  const [password, setPassword] = useState("demo123");
  const [scope, setScope] = useState("national");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const session = loginDemoUser(username.trim(), password, scope);
    if (!session) {
      setError("Invalid demo credentials or dashboard scope for this user.");
      return;
    }
    router.push(session.scope === "national" ? "/dashboard/national" : `/dashboard/regions/${session.regionId}`);
  }

  function quickLogin(user: DemoUser, requestedScope: string) {
    setUsername(user.username);
    setPassword("demo123");
    setScope(requestedScope);
    setError("");
    const session = loginDemoUser(user.username, "demo123", requestedScope);
    if (!session) {
      setError("This demo account cannot access the selected dashboard scope.");
      return;
    }
    router.push(session.scope === "national" ? "/dashboard/national" : `/dashboard/regions/${session.regionId}`);
  }

  const nationalAdmin = demoUsers.find((user) => user.username === "national_admin");
  const regionalAdmins = demoRegionalEnergyData
    .map((region) => ({ region, user: demoUsers.find((item) => item.role === "regional_admin" && item.regionId === region.id) }))
    .filter((item): item is { region: typeof demoRegionalEnergyData[number]; user: DemoUser } => Boolean(item.user));

  const inputClass =
    "mt-2 w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none transition-all duration-300 " +
    "border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 " +
    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 " +
    "focus:border-grid-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,.12),0_0_24px_rgba(34,197,94,.08)] dark:focus:border-grid-400 dark:focus:bg-slate-900";

  const cardClass =
    "rounded-3xl border p-7 shadow-2xl backdrop-blur-xl " +
    "border-slate-200/90 bg-white/85 shadow-slate-200/60 " +
    "dark:border-slate-700/40 dark:bg-slate-900/60 dark:shadow-black/40";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/50 to-cyan-50/40 px-4 py-6 dark:bg-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 md:px-8">
      <LoginBackground />

      {/* top brand bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/brand/neuro-grid-logo.png" alt="Neuro Grid" width={30} height={30} className="h-8 w-8 object-contain" />
          <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-200">NEURO GRID</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-600 dark:border-blue-400/25 dark:text-blue-300">
            Demo Mode — Simulated Data
          </span>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full border border-slate-300 bg-white/80 p-2 text-slate-600 transition-all duration-300 hover:rotate-12 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center py-8">
        <div className="grid w-full gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ------- left: brand + form ------- */}
          <section className={`animate-fade-up ${cardClass}`}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <span className="animate-glow-pulse absolute inset-0 rounded-2xl" />
                <div className="animate-float relative flex h-14 w-14 items-center justify-center rounded-2xl border border-grid-500/30 bg-white dark:border-grid-400/30 dark:bg-slate-900/80">
                  <Image src="/brand/neuro-grid-logo.png" alt="Neuro Grid" width={44} height={44} className="h-11 w-11 object-contain" priority />
                </div>
              </div>
              <div>
                <h1 className="text-gradient text-2xl font-extrabold tracking-tight">Welcome back</h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Sign in to your control center</p>
              </div>
            </div>

            <form onSubmit={submit} className="animate-fade-up stagger-2 mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Username
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} placeholder="national_admin" />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
                <div className="relative">
                  <KeyRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className={inputClass} placeholder="••••••••" />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Dashboard scope
                <div className="relative">
                  <Globe2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <select value={scope} onChange={(event) => setScope(event.target.value)} className={inputClass}>
                    <option value="national">National Control Center</option>
                    {demoRegionalEnergyData.map((region) => (
                      <option key={region.id} value={region.id}>{region.name} Regional Dashboard</option>
                    ))}
                  </select>
                </div>
              </label>

              {error && (
                <p className="animate-shake rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:border-red-400/30 dark:text-red-300">{error}</p>
              )}

              <button className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-grid-600 via-grid-500 to-emerald-400 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-grid-500/25 transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-grid-500/40 active:scale-[0.99]">
                <Lock size={17} /> Enter Control Center
              </button>
            </form>

            <div className="animate-fade-up stagger-3 mt-6 border-t border-slate-200 pt-4 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <Image src="/brand/nv-team-logo.jpeg" alt="NV TEAM" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-grid-500/30" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Powered by</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">NV TEAM</p>
                </div>
                <Sparkles className="ml-auto text-grid-500/70 dark:text-grid-400/70" size={16} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                Demo authentication — competition simulation only. Production must use secure backend authentication.
              </p>
            </div>
          </section>

          {/* ------- right: quick demo login ------- */}
          <section className={`animate-fade-up stagger-2 ${cardClass}`}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grid-500/15 text-grid-600 dark:text-grid-400">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Quick Demo Login</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">One click — straight into any dashboard.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {nationalAdmin && (
                <button
                  onClick={() => quickLogin(nationalAdmin, "national")}
                  className="group animate-fade-up stagger-3 flex items-center justify-between overflow-hidden rounded-2xl border border-grid-500/40 bg-gradient-to-r from-grid-500/15 via-grid-500/8 to-transparent p-4 text-left transition-all duration-300 hover:border-grid-500 hover:shadow-[0_0_30px_rgba(34,197,94,.15)] dark:hover:border-grid-400"
                >
                  <span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">National Control Center</span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">national_admin · demo123</span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-grid-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-grid-500/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105">
                    Login <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </button>
              )}

              <div className="animate-fade-up stagger-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-900/45">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Regional Dashboards</p>
                <div className="mt-3 grid max-h-[340px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {regionalAdmins.map(({ region, user }) => (
                    <button
                      key={region.id}
                      onClick={() => quickLogin(user, region.id)}
                      className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-grid-500/60 hover:bg-grid-500/5 hover:shadow-[0_8px_24px_rgba(34,197,94,.12)] dark:border-slate-700/60 dark:bg-slate-900/70 dark:hover:border-grid-400/60 dark:hover:bg-grid-500/10"
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{region.name}</span>
                        <ArrowRight size={12} className="shrink-0 -translate-x-1 text-grid-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-grid-400" />
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">{user.username} / demo123</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-fade-up stagger-5 mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-500 dark:border-slate-700/40 dark:bg-slate-900/45 dark:text-slate-400">
              National Admin can access all regions and Market Intelligence. Regional users can access only their assigned region. Critical actions remain under human approval.
            </div>
          </section>
        </div>
      </div>

      <footer className="relative z-10 mx-auto w-full max-w-6xl pt-2 text-center text-[11px] text-slate-400 dark:text-slate-600">
        © 2026 NV TEAM — NEURO GRID · AI decision-support platform · Human operator stays in control
      </footer>
    </div>
  );
}

function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* engineering grid */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* aurora blobs */}
      <div className="animate-aurora absolute -left-32 top-[-10%] h-[420px] w-[420px] rounded-full bg-grid-500/15 blur-3xl dark:bg-grid-500/15" />
      <div className="animate-aurora absolute right-[-8%] top-[30%] h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/12" style={{ animationDelay: "-6s" }} />
      <div className="animate-aurora absolute bottom-[-15%] left-[30%] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/12" style={{ animationDelay: "-11s" }} />

      {/* starfield + particles: dark mode only */}
      <div className="hidden dark:block">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 14% 24%, rgba(255,255,255,.45), transparent 50%), radial-gradient(1px 1px at 76% 14%, rgba(255,255,255,.35), transparent 50%), radial-gradient(1.5px 1.5px at 38% 66%, rgba(187,247,208,.35), transparent 50%), radial-gradient(1px 1px at 62% 84%, rgba(255,255,255,.3), transparent 50%), radial-gradient(1px 1px at 88% 52%, rgba(165,243,252,.35), transparent 50%)",
            backgroundSize: "460px 460px",
          }}
        />
        {[
          { left: "12%", top: "70%", delay: "0s", size: 6, color: "rgba(74,222,128,.8)" },
          { left: "28%", top: "30%", delay: "-2s", size: 4, color: "rgba(103,232,249,.8)" },
          { left: "55%", top: "18%", delay: "-4s", size: 5, color: "rgba(74,222,128,.7)" },
          { left: "72%", top: "62%", delay: "-1s", size: 4, color: "rgba(147,197,253,.8)" },
          { left: "88%", top: "26%", delay: "-3.4s", size: 6, color: "rgba(103,232,249,.7)" },
          { left: "42%", top: "82%", delay: "-5s", size: 5, color: "rgba(74,222,128,.65)" },
        ].map((p, i) => (
          <span
            key={i}
            className="animate-float absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 12px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: `${5 + i}s`,
            }}
          />
        ))}
        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_30%,rgba(2,6,23,.55)_100%)]" />
      </div>

      {/* energy beam sweeping across the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="energy-flow opacity-50 dark:opacity-60" />
      </div>
    </div>
  );
}
