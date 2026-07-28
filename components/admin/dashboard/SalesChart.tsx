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

function formatearEje(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }

  return `$${value}`;
}

function formatearDinero(value: number) {
  return `$${Number(value ?? 0).toLocaleString("es-US")}`;
}

export default function SalesChart({
  data,
}: SalesChartProps) {
  return (
    <div className="h-[240px] w-full min-w-0 sm:h-[280px] lg:h-[320px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
      >
        <AreaChart
          data={data}
          margin={{
            top: 12,
            right: 4,
            left: -18,
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
            axisLine={false}
            tickLine={false}
            minTickGap={14}
            tickMargin={10}
            tick={{
              fill: "#71717a",
              fontSize: 11,
            }}
          />

          <YAxis
            width={52}
            axisLine={false}
            tickLine={false}
            tickMargin={6}
            tick={{
              fill: "#71717a",
              fontSize: 11,
            }}
            tickFormatter={(value) =>
              formatearEje(Number(value ?? 0))
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
              padding: "10px 12px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,.45)",
            }}
            labelStyle={{
              color: "#a1a1aa",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#fff",
            }}
            formatter={(value) => [
              formatearDinero(Number(value ?? 0)),
              "Ventas",
            ]}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#salesGradient)"
            activeDot={{
              r: 4,
              strokeWidth: 2,
              fill: "#09090b",
              stroke: "#ffffff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}