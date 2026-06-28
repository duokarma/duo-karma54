import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/types";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2 text-xs shadow-[var(--shadow-dropdown)]">
      <p className="mb-1 font-medium text-ink">{label}</p>
      <p className="text-ink-dim">Expenses: <span className="tabular font-medium text-ink">{formatCurrency(payload[0].value, true)}</span></p>
    </div>
  );
}

export function ExpensesBarChart({ data, height = 280 }: { data: ChartPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar
          dataKey="expenses"
          fill="#2563EB"
          fillOpacity={0.75}
          radius={[3, 3, 0, 0]}
          animationDuration={700}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
