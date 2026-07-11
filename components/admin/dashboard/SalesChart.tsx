"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SalesChartPoint = {
  date: string;
  total: number;
};

type SalesChartProps = {
  data: SalesChartPoint[];
};

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="salesGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#ffffff"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="#ffffff"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{
              fill: "#71717a",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "#71717a",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              `$${Number(value ?? 0).toLocaleString("es-MX")}`
            }
          />

          <Tooltip
            cursor={{
              stroke: "rgba(255,255,255,0.15)",
            }}
            contentStyle={{
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: "12px",
              color: "#fff",
            }}
            labelStyle={{
              color: "#a1a1aa",
            }}
            formatter={(value) => [
              `$${Number(value ?? 0).toLocaleString("es-MX")}`,
              "Ventas",
            ]}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#salesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}