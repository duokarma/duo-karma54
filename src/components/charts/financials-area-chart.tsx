import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/types";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2.5 text-xs shadow-[var(--shadow-dropdown)]">
      <p className="mb-2 font-medium text-ink">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-ink-faint">{p.name}</span>
          </div>
          <span className="tabular font-medium text-ink">{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
}

import React, { memo } from "react";
import { ChartLoader } from "@/components/premium/chart-loader";

export const FinancialsAreaChart = memo(function FinancialsAreaChart({ data, height = 280, isLoading }: { data: ChartPoint[]; height?: number; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div style={{ height }} className="w-full">
        <ChartLoader />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2563EB" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 6"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={54}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          animationDuration={700}
        />
        <Area
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#profitGrad)"
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
