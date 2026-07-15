import { DollarSign, TrendingUp, Receipt, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { Client, ChartPoint } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function RevenuePage() {
  const { data: monthlyFinancials = [], isLoading: isLoadingFin } = useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_metrics").select("*").order("orderIndex");
      if (error) throw error;
      return data as ChartPoint[];
    },
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data as Client[];
    },
  });

  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const avgMonthly = monthlyFinancials.length ? totalRevenue / monthlyFinancials.length : 0;
  const paidRevenue = clients.reduce((s, c) => s + (c.amountPaid || 0), 0);

  const columns: Column<Client>[] = [
    { key: "name", header: "Client", sortValue: (c) => c.name, render: (c) => <span className="font-medium text-ink">{c.name}</span> },
    { key: "company", header: "Company", sortValue: (c) => c.company, render: (c) => c.company },
    {
      key: "amount",
      header: "Promised & Paid",
      align: "right",
      sortValue: (c) => c.totalValue,
      render: (c) => (
        <div className="flex flex-col items-end">
          <span className="tabular font-medium text-ink">{formatCurrency(c.totalValue || 0)}</span>
          {(c.amountPaid !== undefined && c.amountPaid > 0 && c.amountPaid < (c.totalValue || 0)) ? (
             <span className="text-[10px] text-amber">Due: {formatCurrency((c.totalValue || 0) - c.amountPaid)}</span>
          ) : (c.amountPaid !== undefined && c.amountPaid >= (c.totalValue || 0) && (c.totalValue || 0) > 0) ? (
             <span className="text-[10px] text-emerald">Paid in full</span>
          ) : null}
          {c.incomeType === 'monthly' && <span className="text-[10px] text-blue-500">Monthly</span>}
          {c.incomeType === 'yearly' && <span className="text-[10px] text-blue-500">Yearly</span>}
        </div>
      ),
    },
    { key: "status", header: "Status", sortValue: (c) => c.status, render: (c) => <StatusBadge status={c.status} /> },
    { key: "joinedDate", header: "Joined", sortValue: (c) => c.joinedDate, render: (c) => <span className="text-xs tabular">{new Date(c.joinedDate).toLocaleDateString()}</span> },
  ];

  if (isLoadingFin || isLoadingClients) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Revenue" description="Track income across all clients" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Revenue (6mo)" value={totalRevenue} prefix="₹" change={14.6} icon={DollarSign} accent="blue" />
        <KPICard label="Avg Monthly" value={avgMonthly} prefix="₹" change={8.2} icon={TrendingUp} accent="green" />
        <KPICard label="Collected" value={paidRevenue} prefix="₹" change={5.4} icon={Receipt} accent="blue" />
        <KPICard label="Profit Margin" value={45.8} suffix="%" change={2.1} icon={Percent} accent="amber" decimals={1} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialsAreaChart data={monthlyFinancials} height={320} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={clients} rowKey={(c) => c.id} />
        </CardContent>
      </Card>
    </div>
  );
}
