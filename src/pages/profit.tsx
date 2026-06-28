import { TrendingUp, Percent, Target, Award } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitLineChart } from "@/components/charts/profit-line-chart";
import { formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function ProfitPage() {
  const { data: monthlyFinancials = [], isLoading } = useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_metrics").select("*").order("orderIndex");
      if (error) throw error;
      return data as ChartPoint[];
    },
  });

  const totalProfit = monthlyFinancials.reduce((sum, m) => sum + m.profit, 0);
  const bestMonth = [...monthlyFinancials].sort((a, b) => b.profit - a.profit)[0] || { profit: 0 };

  if (isLoading) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Profit" description="Net profit performance and margin trends" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Profit (6mo)" value={totalProfit} prefix="₹" change={22.4} icon={TrendingUp} accent="green" />
        <KPICard label="Avg Margin" value={45.8} suffix="%" change={3.2} icon={Percent} accent="blue" decimals={1} />
        <KPICard label="Best Month" value={bestMonth.profit} prefix="₹" change={0} icon={Award} accent="amber" />
        <KPICard label="Target Progress" value={87} suffix="%" change={5.2} icon={Target} accent="blue" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfitLineChart data={monthlyFinancials} height={340} />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {monthlyFinancials.slice(-3).map((month) => (
          <Card key={month.label} className="p-5">
            <p className="text-xs text-ink-faint">{month.label} 2026</p>
            <p className="mt-1 font-display text-xl font-semibold text-ink tabular">{formatCurrency(month.profit)}</p>
            <p className="mt-1 text-xs text-ink-faint">
              {((month.profit / month.revenue) * 100).toFixed(1)}% margin
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
