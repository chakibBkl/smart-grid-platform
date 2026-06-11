"use client";
import Link from "next/link";
import {
  AlertTriangle,
  BatteryCharging,
  BrainCircuit,
  CheckCircle2,
  CloudSun,
  Gauge,
  Map,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { demoForecastConfidence, demoPeakPressure, demoWeatherImpact } from "@/lib/dashboard/demoOperationalData";
import { demoRegionalEnergyData, getRegionalSummary, type RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { getRegionalRecommendation, getRegionalRiskSummary } from "@/lib/dashboard/regionalDashboardUtils";
import { getStoredScope, type DashboardScope } from "@/lib/dashboard/scope";
import { getAverageDataQuality, getAverageGridHealth, getHighestDemandRegion, getHighestRiskRegion, getNationalRenewableShare, getTotalLoad } from "@/lib/dashboard/nationalAggregations";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";
import { TraceabilityDetails } from "@/components/dashboard/reality/TraceabilityDetails";
import { calculateNationalEnergyBalance, calculateRegionalEnergyBalance, getRecommendationFromLogic } from "@/lib/reality/calculationRules";

type DecisionStatus = "Pending Review" | "Approved" | "Rejected";

const explanations = [
  {
    title: "Risk Explanation",
    icon: AlertTriangle,
    status: "Medium operational risk",
    summary: "Risk is elevated because evening demand is rising while solar generation is expected to fall after sunset.",
    factors: ["Expected peak at 19:00", "Affected region: Algiers", "Battery SOC: 54%", "Solar impact: -18%"],
    recommendation: "Prepare battery discharge and keep demand response ready for the evening window.",
  },
  {
    title: "Recommendation Explanation",
    icon: BatteryCharging,
    status: "Battery dispatch recommended",
    summary: "Battery support from 18:00 to 21:00 can reduce peak pressure in the demo scenario, but the platform does not execute grid actions automatically.",
    factors: ["Peak pressure: High", "Expected load: 140 MW", "Forecast confidence: 91%", "Data quality: 93%"],
    recommendation: "Approve battery support only after operator review of asset and reserve conditions.",
  },
  {
    title: "Forecast Explanation",
    icon: TrendingUp,
    status: `${demoForecastConfidence.model}`,
    summary: "The forecast is influenced by temperature, evening demand behavior, renewable availability, and recent load pattern.",
    factors: [`MAPE: ${demoForecastConfidence.mape}%`, `RMSE: ${demoForecastConfidence.rmseMW} MW`, `Load confidence: ${demoForecastConfidence.load}%`, `Solar confidence: ${demoForecastConfidence.solar}%`],
    recommendation: "Use forecast output as decision support and confirm with live telemetry before critical actions.",
  },
  {
    title: "Weather Impact Explanation",
    icon: CloudSun,
    status: `${demoWeatherImpact.impact} weather impact`,
    summary: "Weather conditions reduce solar output but slightly improve wind contribution, increasing the need for flexible reserves.",
    factors: [`Solar impact: ${demoWeatherImpact.solarImpactPct}%`, `Wind impact: +${demoWeatherImpact.windImpactPct}%`, `Heat load impact: +${demoWeatherImpact.heatLoadImpactPct}%`, `Most affected: ${demoWeatherImpact.mostAffectedRegion}`],
    recommendation: demoWeatherImpact.recommendedAction,
  },
];

export default function AssistantPage() {
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>("Pending Review");
  const [scope, setScope] = useState<DashboardScope>("national");
  const [region, setRegion] = useState<RegionalEnergyData | null>(null);
  const regionalSummary = getRegionalSummary();
  const isRegional = scope === "regional" && region;
  const headline = isRegional ? `${region.name} AI Decision Explanation` : "AI Decision Explanation";
  const description = isRegional
    ? `Ready-made regional explanations for ${region.name}. Market Intelligence is national-only and not used in this regional explanation.`
    : "Ready-made national operational explanations and recommendations for fast control-room decisions. No open chat is required; final approval remains with the human operator.";
  const dailySummary = isRegional ? buildRegionalDailySummary(region) : buildNationalDailySummary();

  useEffect(() => {
    const stored = getStoredScope();
    setScope(stored.scope || "national");
    setRegion(demoRegionalEnergyData.find((item) => item.id === stored.regionId) || null);
  }, []);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-grid-500" size={24} />
              <h1 className="text-2xl font-bold">{headline}</h1>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RealityModeBadge />
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
              Human Approval Required
            </span>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-grid-500/30 bg-grid-500/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Daily General Situation Summary</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{dailySummary.scope} - {dailySummary.date}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${dailySummary.badgeClass}`}>{dailySummary.status}</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{dailySummary.summary}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {dailySummary.metrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-[var(--bg-card)] p-3 text-xs font-medium text-grid-500">{dailySummary.recommendation}</p>
      </section>

      {!isRegional && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">All Regions Daily Situation</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                National view of every independent regional dashboard. This is supervision and explanation only; regional dashboards still require their own login.
              </p>
            </div>
            <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">
              {demoRegionalEnergyData.length} Regions
            </span>
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {demoRegionalEnergyData.map((item) => {
              const balance = calculateRegionalEnergyBalance(item);
              const status = item.gridHealth < 80 || item.demandPressure > 85 || balance.reserveMarginPercent < 5 ? "Warning" : "Operational";
              return (
                <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold">{item.name}</h3>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.wilaya} - {item.energyRole}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${status === "Warning" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600" : "border-green-500/30 bg-green-500/10 text-green-500"}`}>{status}</span>
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${riskClass(item.riskLevel)}`}>{item.riskLevel}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    <Metric label="Load" value={`${item.currentLoadMW} MW`} />
                    <Metric label="Health" value={`${item.gridHealth}%`} />
                    <Metric label="Demand" value={`${item.demandPressure}%`} />
                    <Metric label="Reserve" value={`${balance.reserveMarginPercent}%`} />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {item.name} has {item.demandPressure}% demand pressure, {item.batterySOC}% battery SOC, {item.dataQuality}% data quality, {item.solarPotential}% solar potential, and {item.windPotential}% wind potential.
                  </p>
                  <p className="mt-3 rounded-lg bg-[var(--bg-card)] p-3 text-xs font-medium text-grid-500">
                    AI daily recommendation: {getRecommendationFromLogic(item)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Current Recommended Decision</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Battery discharge recommendation prepared for operator review.</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(decisionStatus)}`}>{decisionStatus}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Metric label="Recommended action" value={isRegional ? region.bestEnergyStrategy : "Discharge battery 18:00-21:00"} />
            <Metric label="Expected peak hour" value={isRegional ? "Regional peak window" : demoPeakPressure.expectedPeakHour} />
            <Metric label="Expected impact" value={isRegional ? `Improve ${region.name} stability` : "Reduce pressure by 12%"} />
          </div>

          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-sm font-semibold">Why this recommendation exists</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {isRegional ? `${getRegionalRiskSummary(region)} ${getRecommendationFromLogic(region)}` : "The system recommends battery support because demand pressure is high, solar forecast is reduced, and the expected peak hour is 19:00. Battery SOC is sufficient for support, while reserve margin is tight. This is a decision-support recommendation and requires human approval."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(isRegional
                ? [`Risk ${region.riskLevel}`, `Battery SOC ${region.batterySOC}%`, `Solar potential ${region.solarPotential}%`, `Data quality ${region.dataQuality}%`]
                : ["High evening demand", "Lower solar generation", "Forecast confidence 91%", "Data quality 93%"]
              ).map((factor) => (
                <div key={factor} className="rounded-lg bg-[var(--bg-card)] p-3 text-xs font-medium">{factor}</div>
              ))}
            </div>
          </div>
          <TraceabilityDetails metric={isRegional ? "riskLevel" : "peakPressure"} assumptions={isRegional ? `${region.name} explanation uses demand pressure, reserve margin ${calculateRegionalEnergyBalance(region).reserveMarginPercent}%, battery SOC, data quality, weather impact, and local asset health.` : "National explanation uses peak pressure, expected solar reduction, battery SOC, forecast confidence, data quality, and reserve margin."} />

          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => setDecisionStatus("Approved")} className="inline-flex items-center gap-2 rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">
              <CheckCircle2 size={16} /> Approve Recommendation
            </button>
            <button onClick={() => setDecisionStatus("Rejected")} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-red-500">
              <XCircle size={16} /> Reject Recommendation
            </button>
            <Link href="/executive" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">
              <Gauge size={16} /> Back to Control Center
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-grid-500" size={20} />
            <h2 className="text-sm font-semibold">Human-Control Reminder</h2>
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            This screen is not a chatbot and does not control the grid. It summarizes reasons, risks, confidence, and recommended actions so the operator can decide quickly.
          </p>
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">Critical actions require operator approval.</div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">Demo data is used when backend telemetry is unavailable.</div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">Recommendations are explainable and reversible.</div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {(isRegional ? regionalExplanations(region) : explanations).map((item) => {
          const Icon = item.icon;
          return (
            <section key={item.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="text-grid-500" size={20} />
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                </div>
                <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-2 py-1 text-[11px] font-semibold text-grid-500">{item.status}</span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{item.summary}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.factors.map((factor) => (
                  <div key={factor} className="rounded-lg bg-[var(--bg-secondary)] p-3 text-xs font-medium">{factor}</div>
                ))}
              </div>
              <p className="mt-4 text-xs font-medium text-grid-500">{item.recommendation}</p>
            </section>
          );
        })}
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center gap-2">
          <Map className="text-grid-500" size={20} />
          <h2 className="text-sm font-semibold">Regional Strategy Explanation</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Metric label="Highest solar potential" value={regionalSummary.highestSolar.name} />
          <Metric label="Highest demand pressure" value={regionalSummary.highestDemand.name} />
          <Metric label="Highest risk region" value={regionalSummary.highestRisk.name} />
          <Metric label="Best hybrid region" value={regionalSummary.bestHybrid.name} />
        </div>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          The platform recommends solar-focused planning for high-potential desert regions, hybrid solar-wind management for industrial coastal hubs, and peak shaving for urban demand centers.
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
      <p className="text-[11px] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function regionalExplanations(region: RegionalEnergyData) {
  return [
    {
      title: "Regional Risk Explanation",
      icon: AlertTriangle,
      status: region.riskLevel,
      summary: getRegionalRiskSummary(region),
      factors: [`Load ${region.currentLoadMW} MW`, `Demand pressure ${region.demandPressure}%`, `Grid health ${region.gridHealth}%`, `Battery SOC ${region.batterySOC}%`],
      recommendation: getRegionalRecommendation(region),
    },
    {
      title: "Regional Forecast Explanation",
      icon: TrendingUp,
      status: "Local forecast",
      summary: `${region.name} forecast depends on demand pressure, weather conditions, industrial demand, and local renewable potential.`,
      factors: [`Solar ${region.solarPotential}%`, `Wind ${region.windPotential}%`, `Temperature ${region.temperature} C`, `Cloud cover ${region.cloudCover}%`],
      recommendation: "Use local telemetry and operator approval before dispatch decisions.",
    },
  ];
}

function buildNationalDailySummary() {
  const totalLoad = getTotalLoad(demoRegionalEnergyData);
  const averageHealth = getAverageGridHealth(demoRegionalEnergyData);
  const averageDataQuality = getAverageDataQuality(demoRegionalEnergyData);
  const renewableShare = getNationalRenewableShare(demoRegionalEnergyData);
  const highestRisk = getHighestRiskRegion(demoRegionalEnergyData);
  const highestDemand = getHighestDemandRegion(demoRegionalEnergyData);
  const balance = calculateNationalEnergyBalance(demoRegionalEnergyData);
  const status = averageHealth < 80 || balance.reserveMarginPercent < 5 ? "Warning" : "Operational";
  return {
    scope: "National Control Center",
    date: new Date().toLocaleDateString(),
    status,
    badgeClass: status === "Warning" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600" : "border-green-500/30 bg-green-500/10 text-green-500",
    summary: `Today, the national demo model is monitoring ${demoRegionalEnergyData.length} regions with ${totalLoad} MW total simulated demand. Average grid health is ${averageHealth}% and average data quality is ${averageDataQuality}%. The most exposed region is ${highestRisk.name}, while ${highestDemand.name} has the highest demand pressure. The national reserve margin is ${balance.reserveMarginPercent}%, so decisions should focus on supervised regional status control, peak pressure monitoring, and data validation before approval.`,
    metrics: [
      { label: "Total Load", value: `${totalLoad} MW` },
      { label: "Avg Health", value: `${averageHealth}%` },
      { label: "Renewable Share", value: `${renewableShare}%` },
      { label: "Reserve Margin", value: `${balance.reserveMarginPercent}%` },
    ],
    recommendation: `Recommended national action: keep ${highestRisk.name} under supervision, review ${highestDemand.name} peak demand, and approve only human-reviewed actions.`,
  };
}

function buildRegionalDailySummary(region: RegionalEnergyData) {
  const balance = calculateRegionalEnergyBalance(region);
  const status = region.gridHealth < 80 || region.demandPressure > 85 || balance.reserveMarginPercent < 5 ? "Warning" : "Operational";
  return {
    scope: `${region.name} Regional Dashboard`,
    date: new Date().toLocaleDateString(),
    status,
    badgeClass: status === "Warning" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600" : "border-green-500/30 bg-green-500/10 text-green-500",
    summary: `Today, ${region.name} is operating with ${region.currentLoadMW} MW simulated local demand, ${region.gridHealth}% grid health, ${region.dataQuality}% data quality, and ${region.riskLevel.toLowerCase()} risk. Demand pressure is ${region.demandPressure}% and battery SOC is ${region.batterySOC}%. The regional reserve margin is ${balance.reserveMarginPercent}%, so local operators should focus on ${region.bestEnergyStrategy.toLowerCase()} while keeping all critical actions under human approval.`,
    metrics: [
      { label: "Local Load", value: `${region.currentLoadMW} MW` },
      { label: "Grid Health", value: `${region.gridHealth}%` },
      { label: "Battery SOC", value: `${region.batterySOC}%` },
      { label: "Reserve Margin", value: `${balance.reserveMarginPercent}%` },
    ],
    recommendation: `Recommended regional action: ${getRecommendationFromLogic(region)} Human approval required before execution.`,
  };
}

function statusClass(status: DecisionStatus) {
  if (status === "Approved") return "border-green-500/30 bg-green-500/10 text-green-500";
  if (status === "Rejected") return "border-red-500/30 bg-red-500/10 text-red-500";
  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500";
}

function riskClass(risk: string) {
  if (risk === "Critical" || risk === "High") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (risk === "Medium-High") return "border-orange-500/30 bg-orange-500/10 text-orange-500";
  if (risk === "Medium") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-600";
  return "border-green-500/30 bg-green-500/10 text-green-500";
}
