import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface InvoiceDonutChartProps {
  data: { label: string; value: number; color: string }[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2 text-xs shadow-[var(--shadow-dropdown)]">
      <p className="font-medium text-ink">{payload[0].name}</p>
      <p className="text-ink-dim">{payload[0].value} invoices</p>
    </div>
  );
}

export function InvoiceDonutChart({ data }: InvoiceDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
              animationDuration={700}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl font-semibold tabular text-ink">{total}</p>
          <p className="text-[10px] text-ink-faint">Total</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 grid w-full grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-ink-faint">{item.label}</span>
            <span className="ml-auto text-xs tabular font-medium text-ink">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
