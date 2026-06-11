"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Download, FileText, ShieldAlert } from "lucide-react";
import { BarChart } from "@/components/charts/BarChart";
import { dashboardKpis, recommendation } from "@/lib/dashboard/demoDashboardData";
import {
  demoActions,
  demoAnomalies,
  demoForecastConfidence,
  demoPeakPressure,
  demoSustainabilityKpis,
} from "@/lib/dashboard/demoOperationalData";
import { demoNotifications, notificationClass } from "@/lib/dashboard/demoNotifications";
import { demoRegionalEnergyData, getRegionalSummary, type RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { getStoredScope, type DashboardScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";
import { getRegionalRecommendation, getRegionalRiskSummary } from "@/lib/dashboard/regionalDashboardUtils";
import type { AuthSession } from "@/lib/auth/demoUsers";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { StatCard } from "@/components/dashboard/StatCard";

const reportTypes = [
  { id: "daily", name: "Daily Operations Report", scope: "Grid health, actions, anomalies, forecast confidence" },
  { id: "risk", name: "Risk & Peak Pressure Report", scope: "Peak risk, affected regions, recommended operator actions" },
  { id: "renewable", name: "Renewables & Sustainability Report", scope: "Renewable share, weather impact, CO2 avoided, utilization" },
  { id: "regional", name: "Geo Intelligence Report", scope: "Regional potential, demand pressure, hybrid strategy comparison" },
];

const reportMetrics = [
  { name: "Grid Health", value: 87 },
  { name: "Forecast Confidence", value: demoForecastConfidence.load },
  { name: "Data Quality", value: demoForecastConfidence.dataQuality },
  { name: "Renewable Utilization", value: demoSustainabilityKpis.renewableUtilizationPct },
  { name: "Risk Control", value: 76 },
];

type DecisionLogEntry = {
  id: string;
  title: string;
  status: string;
  user: string;
  role: string;
  scope: string;
  regionId: string;
  timestamp: string;
};

export default function ReportsPage() {
  const [selected, setSelected] = useState("daily");
  const [scope, setScope] = useState<DashboardScope>("national");
  const [region, setRegion] = useState<RegionalEnergyData | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogEntry[]>([]);
  const regionalSummary = getRegionalSummary();
  const reportText = useMemo(() => buildReport(selected, regionalSummary, scope, region, decisionLogs), [selected, regionalSummary, scope, region, decisionLogs]);

  useEffect(() => {
    const activeSession = getAuthSession();
    setSession(activeSession);
    const stored = getStoredScope();
    setScope(stored.scope || "national");
    const selectedRegion = demoRegionalEnergyData.find((item) => item.id === stored.regionId) || null;
    setRegion(selectedRegion);
    setDecisionLogs(readDecisionLogs(stored.scope || "national", selectedRegion?.id || null, activeSession));
  }, []);

  if (!session) {
    return (
      <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
        <h1 className="text-2xl font-bold">Login required</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Reports require an authenticated dashboard session.</p>
      </section>
    );
  }

  function downloadReport() {
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nv-team-${selected}-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{scope === "regional" && region ? `${region.name} Reports Center` : "National Reports Center"}</h1>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              {scope === "regional" && region
                ? "Generate selected-region reports only. National market intelligence and all-region rankings are not mixed into regional reports."
                : "Generate competition-ready national summaries from dashboard, optimization, renewables, notifications, market intelligence, and Geo Intelligence demo data."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RealityModeBadge />
            <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">
              <Download size={16} /> Export TXT
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={ShieldAlert} label="Open Actions" value={demoActions.length.toString()} detail="operator review" />
        <Kpi icon={Bell} label="Notifications" value={demoNotifications.length.toString()} detail="demo alerts" />
        <Kpi icon={CheckCircle2} label="Forecast Confidence" value={`${demoForecastConfidence.load}%`} detail={demoForecastConfidence.model} />
        <Kpi icon={FileText} label="Report Types" value={reportTypes.length.toString()} detail="ready to export" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Report Templates</h2>
          <div className="mt-4 space-y-2">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelected(report.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${selected === report.id ? "border-grid-500 bg-grid-500/10" : "border-[var(--border)] bg-[var(--bg-secondary)]"}`}
              >
                <p className="text-sm font-semibold">{report.name}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{report.scope}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Report Quality Metrics</h2>
          <p className="mb-4 mt-1 text-xs text-[var(--text-secondary)]">Current data quality and confidence signals included in generated reports.</p>
          <BarChart data={reportMetrics} bars={[{ dataKey: "value", color: "#22c55e", name: "Score %" }]} height={280} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Generated Report Preview</h2>
            <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-2 py-1 text-xs font-semibold text-grid-500">Demo Mode</span>
          </div>
          <pre className="mt-4 max-h-[430px] overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--bg-secondary)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">{reportText}</pre>
          <TraceabilityDetails metric={scope === "regional" ? "riskLevel" : "regionalComparison"} />
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Notification Log</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Same operational alerts shown in the top notification bell.</p>
          <div className="mt-4 space-y-3">
            {demoNotifications.map((item) => (
              <div key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.message}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${notificationClass(item.severity)}`}>{item.severity}</span>
                </div>
                <p className="mt-2 text-[11px] text-[var(--text-secondary)]">{item.source} - {item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <h2 className="text-sm font-semibold">Decision Log</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {scope === "regional" && region ? `Showing ${region.name} regional approvals only.` : "Showing national and regional approvals available to the National Control Center."}
        </p>
        <div className="mt-4 space-y-3">
          {decisionLogs.length === 0 && <p className="rounded-lg bg-[var(--bg-secondary)] p-3 text-xs text-[var(--text-secondary)]">No approval decisions have been recorded yet in this demo session.</p>}
          {decisionLogs.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] p-3 text-xs">
              <div>
                <p className="font-semibold">{entry.title}</p>
                <p className="mt-1 text-[var(--text-secondary)]">{entry.scope === "regional" ? `Region: ${entry.regionId}` : "National scope"} - {entry.user} ({entry.role.replace(/_/g, " ")})</p>
              </div>
              <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-2 py-0.5 font-semibold text-grid-500">{entry.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildReport(selected: string, regionalSummary: ReturnType<typeof getRegionalSummary>, scope: DashboardScope, region: RegionalEnergyData | null, decisionLogs: DecisionLogEntry[]) {
  const title = reportTypes.find((report) => report.id === selected)?.name || "Operations Report";
  const logLines = decisionLogs.length > 0 ? decisionLogs.slice(0, 6).map((item) => `- ${item.title}: ${item.status} by ${item.user}`) : ["- No approval decisions recorded yet."];
  if (scope === "regional" && region) {
    return [
      `NV TEAM Smart Grid Platform - ${region.name} Regional Report`,
      "Generated from safe demo data for regional operator decision support.",
      "",
      "Regional Summary",
      `- Region: ${region.name}`,
      `- Wilaya: ${region.wilaya}`,
      `- Current load: ${region.currentLoadMW} MW`,
      `- Grid health: ${region.gridHealth}%`,
      `- Risk level: ${region.riskLevel}`,
      `- Battery SOC: ${region.batterySOC}%`,
      `- Solar potential: ${region.solarPotential}%`,
      `- Wind potential: ${region.windPotential}%`,
      "",
      "Regional Risk",
      `- ${getRegionalRiskSummary(region)}`,
      "",
      "Regional Recommendation",
      `- ${getRegionalRecommendation(region)}`,
      "",
      "Decision Log",
      ...logLines,
      "",
      "Market Intelligence",
      "- Not included. Market Intelligence is available only at the National Dashboard level.",
      "",
      "Human Control Statement",
      "The platform provides regional forecasting, risk analysis, recommendations, and explanations. Critical actions remain under human approval.",
    ].join("\n");
  }

  return [
    `NV TEAM Smart Grid Platform - ${title}`,
    "Generated from safe demo data for competition presentation.",
    "",
    "Executive Summary",
    `- Current load: ${dashboardKpis.currentLoadMW} MW`,
    `- Renewable share: ${dashboardKpis.renewableShare}%`,
    `- Battery SOC: ${dashboardKpis.batterySOC}%`,
    `- Risk level: ${dashboardKpis.riskLevel}`,
    `- Forecast MAPE: ${dashboardKpis.forecastAccuracyMape}%`,
    "",
    "Recommended Decision",
    `- Action: ${recommendation.action}`,
    `- Reason: ${recommendation.reason}`,
    `- Expected saving: ${recommendation.expectedSavingDZD.toLocaleString()} DZD`,
    `- Confidence: ${recommendation.confidence}%`,
    "",
    "Peak Pressure",
    `- Level: ${demoPeakPressure.level}`,
    `- Affected region: ${demoPeakPressure.affectedRegion}`,
    `- Expected hour: ${demoPeakPressure.expectedPeakHour}`,
    `- Recommended action: ${demoPeakPressure.recommendedAction}`,
    "",
    "Anomalies",
    ...demoAnomalies.map((item) => `- ${item.region}: ${item.description} Recommended action: ${item.recommendedAction}`),
    "",
    "Geo Intelligence",
    `- Highest solar potential: ${regionalSummary.highestSolar.name}`,
    `- Highest demand pressure: ${regionalSummary.highestDemand.name}`,
    `- Highest risk region: ${regionalSummary.highestRisk.name}`,
    `- Best hybrid region: ${regionalSummary.bestHybrid.name}`,
    "",
    "Decision Logs",
    ...logLines,
    "",
    "Human Control Statement",
    "The platform provides forecasting, anomaly detection, risk analysis, recommendations, and explanations. Critical actions remain under human approval.",
  ].join("\n");
}

function readDecisionLogs(scope: DashboardScope, regionId: string | null, session: AuthSession | null): DecisionLogEntry[] {
  if (typeof window === "undefined") return [];
  if (scope === "regional" && regionId) return parseLog(localStorage.getItem(`decisionLog:region:${regionId}`));
  if (session?.role === "national_admin" || session?.role === "national_operator") {
    return [
      ...parseLog(localStorage.getItem("decisionLog:national")),
      ...demoRegionalEnergyData.flatMap((item) => parseLog(localStorage.getItem(`decisionLog:region:${item.id}`))),
    ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  return [];
}

function parseLog(raw: string | null): DecisionLogEntry[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DecisionLogEntry[];
  } catch {
    return [];
  }
}

function Kpi(props: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return <StatCard {...props} />;
}
