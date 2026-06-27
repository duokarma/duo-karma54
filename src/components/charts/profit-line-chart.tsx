import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/types";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg glass-panel-strong px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-ink">{label}</p>
      <p className="text-emerald">Profit: {formatCurrency(payload[0].value, true)}</p>
    </div>
  );
}

export function ProfitLineChart({ data, height = 280 }: { data: ChartPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }}
          tickFormatter={(v) => formatCurrency(v, true)}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#2dd4a4"
          strokeWidth={3}
          dot={{ fill: "#2dd4a4", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#08090b" }}
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
