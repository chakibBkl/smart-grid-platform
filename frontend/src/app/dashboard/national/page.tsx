"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Globe2, ShieldAlert, Zap } from "lucide-react";
import { ActionCenter } from "@/components/dashboard/ActionCenter";
import { GeoIntelligencePreviewCard } from "@/components/dashboard/GeoIntelligencePreviewCard";
import { RiskAlertCenter } from "@/components/dashboard/RiskAlertCenter";
import { NationalRegionControlPanel } from "@/components/dashboard/national/NationalRegionControlPanel";
import { DemoAssumptionsPanel } from "@/components/dashboard/reality/DemoAssumptionsPanel";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { StatCard } from "@/components/dashboard/StatCard";
import { ValidationWarning } from "@/components/dashboard/reality/ValidationWarning";
import { BarChart } from "@/components/charts/BarChart";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { riskAlerts } from "@/lib/dashboard/demoDashboardData";
import { setNationalScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import { canAccessNationalDashboard } from "@/lib/auth/permissions";
import {
  getAverageDataQuality,
  getAverageGridHealth,
  getBestHybridRegion,
  getHighestDemandRegion,
  getHighestRiskRegion,
  getHighestSolarRegion,
  getNationalRenewableShare,
  getTotalLoad,
} from "@/lib/dashboard/nationalAggregations";
import { riskBadgeClass } from "@/lib/dashboard/riskCalculations";
import { calculateNationalEnergyBalance } from "@/lib/reality/calculationRules";
import { validateRegions } from "@/lib/reality/validationRules";

export default function NationalDashboardPage() {
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const highestRisk = getHighestRiskRegion(demoRegionalEnergyData);
  const highestDemand = getHighestDemandRegion(demoRegionalEnergyData);
  const highestSolar = getHighestSolarRegion(demoRegionalEnergyData);
  const bestHybrid = getBestHybridRegion(demoRegionalEnergyData);
  const nationalBalance = calculateNationalEnergyBalance(demoRegionalEnergyData);
  const validation = validateRegions(demoRegionalEnergyData);

  useEffect(() => {
    const activeSession = getAuthSession();
    if (!activeSession) {
      router.replace("/login");
      return;
    }
    if (!canAccessNationalDashboard(activeSession)) {
      setBlocked(true);
      return;
    }
    setNationalScope();
  }, [router]);

  if (blocked) {
    return <AccessDenied message="National Dashboard requires National Admin or National Operator access." />;
  }

  const ranking = demoRegionalEnergyData.map((region) => ({
    name: region.name.length > 14 ? region.name.slice(0, 14) : region.name,
    load: region.currentLoadMW,
    health: region.gridHealth,
    demand: region.demandPressure,
  }));

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">National Control Center</h1>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">All-region operational visibility, strategic intelligence, Geo Intelligence, and Market Intelligence access. Values are aggregated from the regional demo dataset.</p>
          </div>
          <RealityModeBadge />
        </div>
      </header>

      <DemoAssumptionsPanel />
      <ValidationWarning warnings={validation.warnings} />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">National Energy Balance</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Calculated from all regional demand and simulated supply components.</p>
          </div>
          <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">{nationalBalance.status}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <Metric label="Demand" value={`${nationalBalance.totalDemandMW} MW`} />
          <Metric label="Supply" value={`${nationalBalance.totalSupplyMW} MW`} />
          <Metric label="Solar" value={`${nationalBalance.solarMW} MW`} />
          <Metric label="Wind" value={`${nationalBalance.windMW} MW`} />
          <Metric label="Reserve Margin" value={`${nationalBalance.reserveMarginPercent}%`} />
        </div>
        <TraceabilityDetails metric="energyBalance" />
      </section>

      <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Globe2} label="Regions monitored" value={demoRegionalEnergyData.length.toString()} detail="national scope" />
        <Kpi icon={Zap} label="Total Load" value={`${getTotalLoad(demoRegionalEnergyData)} MW`} detail="all regions" />
        <Kpi icon={ShieldAlert} label="Avg Grid Health" value={`${getAverageGridHealth(demoRegionalEnergyData)}%`} detail={`Highest risk: ${highestRisk.name}`} />
        <Kpi icon={BarChart3} label="Renewable Share" value={`${getNationalRenewableShare(demoRegionalEnergyData)}%`} detail={`Data quality ${getAverageDataQuality(demoRegionalEnergyData)}%`} />
      </div>

      <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Summary title="Highest risk region" region={highestRisk.name} detail={highestRisk.riskLevel} />
        <Summary title="Highest demand pressure" region={highestDemand.name} detail={`${highestDemand.demandPressure}%`} />
        <Summary title="Best solar region" region={highestSolar.name} detail={`${highestSolar.solarPotential}%`} />
        <Summary title="Best hybrid region" region={bestHybrid.name} detail={bestHybrid.bestEnergyStrategy} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Performance Summary</h2>
          <p className="mb-4 mt-1 text-xs text-[var(--text-secondary)]">National ranking by load, grid health, and demand pressure.</p>
          <BarChart data={ranking} bars={[
            { dataKey: "load", color: "#3b82f6", name: "Load MW" },
            { dataKey: "health", color: "#22c55e", name: "Grid Health %" },
            { dataKey: "demand", color: "#ef4444", name: "Demand Pressure %" },
          ]} height={320} />
        </section>
        <GeoIntelligencePreviewCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ActionCenter />
        <RiskAlertCenter alerts={riskAlerts} />
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Access Policy</h2>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">Regional dashboards are independent. National Dashboard can supervise and control region status, but does not enter regional dashboards.</p>
          <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto">
            {demoRegionalEnergyData.map((region) => (
              <div key={region.id} className="flex w-full items-center justify-between gap-3 rounded-lg bg-[var(--bg-secondary)] p-3 text-left text-xs">
                <span className="font-semibold">{region.name}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskBadgeClass(region.riskLevel)}`}>{region.riskLevel}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <NationalRegionControlPanel session={getAuthSession()} />
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  return <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6"><h1 className="text-2xl font-bold text-red-500">Access denied</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p><Link href="/login" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Login with another account</Link></section>;
}

function Kpi(props: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return <StatCard {...props} />;
}

function Summary({ title, region, detail }: { title: string; region: string; detail: string }) {
  return <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"><p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{title}</p><p className="mt-2 text-lg font-bold">{region}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{detail}</p></section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-[var(--bg-secondary)] p-3"><p className="text-[11px] text-[var(--text-secondary)]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
