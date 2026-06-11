"use client";
import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AreaChartProps<T> {
  data: T[];
  lines: { dataKey: string; color: string; name: string }[];
  xKey?: string;
  height?: number;
}

export function AreaChart<T>({ data, lines, xKey = "timestamp", height = 300 }: AreaChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data}>
        <defs>
          {lines.map((line) => (
            <linearGradient key={line.dataKey} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            if (!v) return "";
            const d = new Date(v);
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          }}
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontSize: "12px",
            boxShadow: "var(--card-shadow-hover)",
          }}
          labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
          itemStyle={{ color: "var(--text-secondary)" }}
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {lines.map((line) => (
          <Area
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            name={line.name}
            fill={`url(#gradient-${line.dataKey})`}
            strokeWidth={2}
          />
        ))}
      </RechartsArea>
    </ResponsiveContainer>
  );
}
