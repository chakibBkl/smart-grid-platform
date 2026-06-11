"use client";
import { useState, useEffect } from "react";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EnergyFlow } from "@/components/dashboard/EnergyFlow";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { KpiCard as KpiCardType } from "@/types";

const generateGridData = () => Array.from({ length: 96 }, (_, i) => {
  const h = (i / 4) % 24;
  return {
    timestamp: new Date(2026, 5, 9, Math.floor(h), (h % 1) * 60).toISOString(),
    frequency: 60 + (Math.random() - 0.5) * 0.1,
    voltage: 1.0 + (Math.random() - 0.5) * 0.02,
    grid_load: 50 + 15 * Math.sin(2 * Math.PI * (h - 6) / 24) + (Math.random() - 0.5) * 5,
    renewable_pct: 35 + 15 * Math.sin(2 * Math.PI * (h - 8) / 12) + (Math.random() - 0.5) * 5,
  };
});

export default function GridPage() {
  const { lastMessage } = useWebSocket();
  const [gridData] = useState(generateGridData);
  const [currentData, setCurrentData] = useState({ load: 52.3, solar: 28.1, wind: 18.5, battery: 45.0 });

  useEffect(() => {
    if (lastMessage && lastMessage.type === "realtime_update") {
      setCurrentData({
        load: lastMessage.load_mw as number || 50,
        solar: lastMessage.solar_mw as number || 25,
        wind: lastMessage.wind_mw as number || 20,
        battery: lastMessage.battery_soc as number || 50,
      });
    }
  }, [lastMessage]);

  const latest = gridData[gridData.length - 1];
  const kpis: KpiCardType[] = [
    { title: "Grid Frequency", value: (latest?.frequency || 60).toFixed(3), unit: "Hz", change: 0.02, changeType: "increase", icon: "zap" },
    { title: "Voltage Level", value: (latest?.voltage || 1).toFixed(3), unit: "pu", change: -0.15, changeType: "decrease", icon: "zap" },
    { title: "Renewable Share", value: (latest?.renewable_pct || 42).toFixed(1), unit: "%", change: 5.2, changeType: "increase", icon: "sun" },
    { title: "Battery Status", value: currentData.battery.toFixed(1), unit: "%", change: 2.1, changeType: "increase", icon: "battery" },
  ];

  const statusItems = [
    { label: "Grid Status", value: "Stable", color: "text-green-500" },
    { label: "Load Balance", value: currentData.load > currentData.solar + currentData.wind ? "Deficit" : "Surplus", color: currentData.load > currentData.solar + currentData.wind ? "text-orange-500" : "text-green-500" },
    { label: "Reserve Margin", value: "18.5%", color: "text-green-500" },
    { label: "CO2 Intensity", value: "245 g/kWh", color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grid Monitoring Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Real-time grid status, stability metrics, and renewable integration</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusItems.map((item) => (
          <div key={item.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-xs text-[var(--text-secondary)]">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <EnergyFlow load={currentData.load} solar={currentData.solar} wind={currentData.wind} battery={currentData.battery} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">Grid Frequency & Voltage</h3>
          <AreaChart
            data={gridData.slice(-48)}
            lines={[
              { dataKey: "frequency", color: "#22c55e", name: "Frequency (Hz)" },
              { dataKey: "voltage", color: "#3b82f6", name: "Voltage (pu)" },
            ]}
          />
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">Renewable Penetration</h3>
          <AreaChart
            data={gridData.slice(-48)}
            lines={[
              { dataKey: "renewable_pct", color: "#22c55e", name: "Renewable %" },
              { dataKey: "grid_load", color: "#f97316", name: "Grid Load (MW)" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
