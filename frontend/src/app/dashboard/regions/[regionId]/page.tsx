"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Battery, CloudSun, MapPin, ShieldAlert, Sun, Wind } from "lucide-react";
import { OperatorNotes } from "@/components/dashboard/OperatorNotes";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemoAssumptionsPanel } from "@/components/dashboard/reality/DemoAssumptionsPanel";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { ValidationWarning } from "@/components/dashboard/reality/ValidationWarning";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";
import {
  getRegionalActionItems,
  getRegionalAssetHealth,
  getRegionalForecastConfidence,
  getRegionalRecommendation,
  getRegionalRiskSummary,
  getRegionalWeatherImpact,
} from "@/lib/dashboard/regionalDashboardUtils";
import { setRegionalScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import { canAccessRegionDashboard } from "@/lib/auth/permissions";
import { getRegionStatus } from "@/lib/auth/regionStatus";
import { calculateRegionalEnergyBalance, getRecommendationFromLogic } from "@/lib/reality/calculationRules";
import { validateRegionData } from "@/lib/reality/validationRules";

export default function RegionalDashboardPage() {
  const params = useParams<{ regionId: string }>();
  const region = demoRegionalEnergyData.find((item) => item.id === params.regionId);
  const [blocked, setBlocked] = useState("");

  useEffect(() => {
    const activeSession = getAuthSession();
    if (!activeSession) {
      setBlocked("login");
      return;
    }
    if (region && !canAccessRegionDashboard(activeSession, region.id)) {
      setBlocked("permission");
      return;
    }
    if (region) setRegionalScope(region.id);
  }, [region]);

  if (!region) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h1 className="text-2xl font-bold">Region not found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Choose a valid operating region to continue.</p>
        <Link href="/select-region" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Return to scope selection</Link>
      </section>
    );
  }

  if (blocked === "login") {
    return <AccessDenied message="Please login before opening a regional dashboard." />;
  }

  if (blocked === "permission") {
    return <AccessDenied message="This user can access only their assigned regional dashboard." />;
  }

  const operationalStatus = getRegionStatus(region.id, region.riskLevel);
  if (operationalStatus === "Disabled") {
    return (
      <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-2xl font-bold text-red-500">Regional dashboard disabled</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">This regional dashboard is currently disabled by the National Control Center. Please contact the National Admin.</p>
        <Link href="/login" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Return to Login</Link>
      </section>
    );
  }

  const weather = getRegionalWeatherImpact(region);
  const forecast = getRegionalForecastConfidence(region);
  const actions = getRegionalActionItems(region);
  const assets = getRegionalAssetHealth(region);
  const balance = calculateRegionalEnergyBalance(region);
  const validation = validateRegionData(region);

  return (
    <div className="space-y-6">
      <DemoAssumptionsPanel />
      <ValidationWarning warnings={validation.warnings} />
      {operationalStatus === "Maintenance" && (
        <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-600">
          Maintenance Mode: This region is under national supervision. Some actions may be limited.
        </section>
      )}
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{region.name} Regional Dashboard</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{region.wilaya} - {region.energyRole}</p>
            <p className="mt-2 max-w-4xl text-xs text-[var(--text-secondary)]">This regional dashboard uses only {region.name} demo values. National values appear only as labeled references.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RealityModeBadge />
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeClass(region.riskLevel)}`}>{region.riskLevel}</span>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">{region.name} Energy Balance</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Region-specific demand and simulated supply calculation.</p>
          </div>
          <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">{balance.status}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <Metric label="Demand" value={`${balance.totalDemandMW} MW`} />
          <Metric label="Supply" value={`${balance.totalSupplyMW} MW`} />
          <Metric label="Battery" value={`${balance.batteryMW} MW`} />
          <Metric label="Conventional" value={`${balance.conventionalMW} MW`} />
          <Metric label="Reserve Margin" value={`${balance.reserveMarginPercent}%`} />
        </div>
        <TraceabilityDetails metric="energyBalance" assumptions={`Calculated only from ${region.name} regional demo inputs.`} />
      </section>

      <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi icon={MapPin} label="Current Load" value={`${region.currentLoadMW} MW`} detail="regional only" />
        <Kpi icon={Sun} label="Solar Potential" value={`${region.solarPotential}%`} detail={`${weather.solarImpactPct}% weather impact`} />
        <Kpi icon={Wind} label="Wind Potential" value={`${region.windPotential}%`} detail={`${weather.windImpactPct}% wind impact`} />
        <Kpi icon={Battery} label="Battery SOC" value={`${region.batterySOC}%`} detail="local reserve" />
        <Kpi icon={ShieldAlert} label="Grid Health" value={`${region.gridHealth}%`} detail={getRegionalRiskSummary(region)} />
        <Kpi icon={CloudSun} label="Data Quality" value={`${region.dataQuality}%`} detail={`Forecast ${forecast.load}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Action Center</h2>
          <div className="mt-4 space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="rounded-lg bg-[var(--bg-secondary)] p-3">
                <p className="text-xs font-semibold">{action.title}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{action.description}</p>
                <p className="mt-2 text-xs font-medium text-grid-500">{action.recommendedAction}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Forecast Confidence</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Load" value={`${forecast.load}%`} />
            <Metric label="Solar" value={`${forecast.solar}%`} />
            <Metric label="Wind" value={`${forecast.wind}%`} />
            <Metric label="MAPE" value={`${forecast.mape}%`} />
          </div>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">{forecast.model}</p>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Decision Explanation</h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{getRecommendationFromLogic(region)} This is decision-support only and requires operator approval.</p>
          <p className="mt-3 rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">Market Intelligence is national-only and not available in this regional dashboard.</p>
          <TraceabilityDetails metric="riskLevel" assumptions={`Risk and recommendation use ${region.name} demand pressure, reserve margin, battery SOC, data quality, weather impact, and asset health.`} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Weather Impact</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Impact" value={weather.impact} />
            <Metric label="Solar" value={`${weather.solarImpactPct}%`} />
            <Metric label="Wind" value={`${weather.windImpactPct}%`} />
            <Metric label="Heat Load" value={`+${weather.heatLoadImpactPct}%`} />
          </div>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">{weather.recommendedAction}</p>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Asset Health</h2>
          <div className="mt-4 space-y-3">
            {assets.map((asset) => (
              <div key={asset.name}>
                <div className="mb-1 flex justify-between text-xs"><span>{asset.name}</span><span className="font-semibold">{asset.value}</span></div>
                <div className="h-2 rounded-full bg-[var(--bg-secondary)]"><div className="h-full rounded-full bg-grid-500" style={{ width: `${asset.percent ?? 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Data Sources</h2>
          <div className="mt-4 space-y-2 text-xs">
            <Metric label="Regional sensors" value={`${region.dataQuality}%`} />
            <Metric label="Weather feed" value="Simulated" />
            <Metric label="Plant connector" value="Pilot Ready" />
            <Metric label="Market access" value="National only" />
          </div>
        </section>
        <OperatorNotes />
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <h2 className="text-sm font-semibold">Current Region Geo Preview</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{region.name} is located at lat {region.lat}, lng {region.lng}. Full national comparison is available from the National Dashboard and Geo Intelligence.</p>
        <Link href="/dashboard/national" className="mt-4 inline-flex rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">Back to National Dashboard</Link>
      </section>
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  return <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6"><h1 className="text-2xl font-bold text-red-500">Access denied</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p><Link href="/login" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Login</Link></section>;
}

function Kpi(props: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return <StatCard {...props} />;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--bg-secondary)] p-3"><p className="text-[11px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
