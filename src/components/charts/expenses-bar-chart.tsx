import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/types";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg glass-panel-strong px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-ink">{label}</p>
      <p className="text-amber">Expenses: {formatCurrency(payload[0].value, true)}</p>
    </div>
  );
}

export function ExpensesBarChart({ data, height = 280 }: { data: ChartPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5a524" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#f5a524" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="expenses" fill="url(#expensesGradient)" radius={[6, 6, 0, 0]} animationDuration={900} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}
