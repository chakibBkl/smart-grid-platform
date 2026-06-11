"use client";
import { CloudSun, Leaf, Sun, Wind, Zap } from "lucide-react";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { GeoIntelligencePreviewCard } from "@/components/dashboard/GeoIntelligencePreviewCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { RenewableIntegrationPanel } from "@/components/dashboard/RenewableIntegrationPanel";
import { SustainabilityKpis } from "@/components/dashboard/SustainabilityKpis";
import { WeatherImpactIndex } from "@/components/dashboard/WeatherImpactIndex";
import { dashboardKpis, loadSeries } from "@/lib/dashboard/demoDashboardData";
import { demoRegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { demoSustainabilityKpis, demoWeatherImpact } from "@/lib/dashboard/demoOperationalData";

const renewableForecast = loadSeries.map((point) => ({
  ...point,
  renewable_total: Math.round((point.solar_mw + point.wind_mw) * 10) / 10,
  demand_support: Math.round(((point.solar_mw + point.wind_mw) / point.load_mw) * 100),
}));

const topRegions = [...demoRegionalEnergyData]
  .sort((a, b) => b.solarPotential + b.windPotential - (a.solarPotential + a.windPotential))
  .slice(0, 6)
  .map((region) => ({
    name: region.name.length > 13 ? region.name.slice(0, 13) : region.name,
    solar: region.solarPotential,
    wind: region.windPotential,
    demand: region.demandPressure,
  }));

export default function RenewablesPage() {
  return (
    <div className="space-y-6">
      <header className="animate-fade-up relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-grid-500 via-cyan-400 to-transparent" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Renewables Control Center</h1>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              Solar, wind, weather impact, curtailment risk, and regional renewable opportunities for human-controlled dispatch decisions.
            </p>
          </div>
          <span className="rounded-full border border-grid-500/30 bg-grid-500/10 px-3 py-1 text-xs font-semibold text-grid-500">Demo Renewable Intelligence</span>
        </div>
      </header>

      <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={Leaf} label="Renewable Share" value={`${dashboardKpis.renewableShare}%`} detail="today" />
        <Kpi icon={Sun} label="Solar Output" value={`${dashboardKpis.solarMW} MW`} detail={`${demoWeatherImpact.solarImpactPct}% weather impact`} />
        <Kpi icon={Wind} label="Wind Output" value={`${dashboardKpis.windMW} MW`} detail={`+${demoWeatherImpact.windImpactPct}% weather impact`} />
        <Kpi icon={CloudSun} label="Curtailment Risk" value={demoSustainabilityKpis.curtailmentRisk} detail="demo estimate" />
        <Kpi icon={Zap} label="Utilization" value={`${demoSustainabilityKpis.renewableUtilizationPct}%`} detail="renewable dispatch" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RenewableIntegrationPanel />
        <WeatherImpactIndex />
        <SustainabilityKpis />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Solar / Wind Forecast</h2>
          <p className="mb-4 mt-1 text-xs text-[var(--text-secondary)]">24-hour simulated renewable contribution and demand support.</p>
          <AreaChart data={renewableForecast} lines={[
            { dataKey: "solar_mw", color: "#eab308", name: "Solar MW" },
            { dataKey: "wind_mw", color: "#3b82f6", name: "Wind MW" },
            { dataKey: "renewable_total", color: "#22c55e", name: "Renewable Total" },
          ]} height={300} />
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Regional Renewable Potential</h2>
          <p className="mb-4 mt-1 text-xs text-[var(--text-secondary)]">Top demo regions by solar and wind potential.</p>
          <BarChart data={topRegions} bars={[
            { dataKey: "solar", color: "#eab308", name: "Solar Potential %" },
            { dataKey: "wind", color: "#3b82f6", name: "Wind Potential %" },
            { dataKey: "demand", color: "#ef4444", name: "Demand Pressure %" },
          ]} height={300} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GeoIntelligencePreviewCard />
        <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h2 className="text-sm font-semibold">Renewable Dispatch Recommendation</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Recommendation title="Solar" text="Use Adrar and Hassi Messaoud as solar-first planning references." />
            <Recommendation title="Wind" text="Use Arzew, Skikda, and Annaba for coastal wind support scenarios." />
            <Recommendation title="Storage" text="Hold reserve for evening peak when solar production drops." />
          </div>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">
            These are demo recommendations only. The platform supports operator decision-making and does not control real renewable assets automatically.
          </p>
        </section>
      </div>
    </div>
  );
}

function Kpi(props: { icon: React.ElementType; label: string; value: string; detail: string }) {
  return <StatCard {...props} />;
}

function Recommendation({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
      <p className="text-xs font-semibold text-grid-500">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}
