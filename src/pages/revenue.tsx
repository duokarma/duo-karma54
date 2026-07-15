import { DollarSign, TrendingUp, Receipt, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { Invoice, ChartPoint } from "@/types";
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

  const { data: invoices = [], isLoading: isLoadingInv } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*");
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const totalRevenue = monthlyFinancials.reduce((sum, m) => sum + m.revenue, 0);
  const avgMonthly = monthlyFinancials.length ? totalRevenue / monthlyFinancials.length : 0;
  const paidRevenue = invoices.reduce((s, i) => s + (i.amountPaid !== undefined ? i.amountPaid : (i.status === "paid" ? i.amount : 0)), 0);

  const columns: Column<Invoice>[] = [
    { key: "invoiceNumber", header: "Invoice", sortValue: (i) => i.invoiceNumber, render: (i) => <span className="font-medium text-ink">{i.invoiceNumber}</span> },
    { key: "client", header: "Client", sortValue: (i) => i.client, render: (i) => i.client },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortValue: (i) => i.amount,
      render: (i) => (
        <div className="flex flex-col items-end">
          <span className="tabular font-medium text-ink">{formatCurrency(i.amount)}</span>
          {(i.amountPaid !== undefined && i.amountPaid > 0 && i.amountPaid < i.amount) ? (
             <span className="text-[10px] text-amber">Due: {formatCurrency(i.amount - i.amountPaid)}</span>
          ) : (i.amountPaid !== undefined && i.amountPaid >= i.amount) ? (
             <span className="text-[10px] text-emerald">Paid in full</span>
          ) : null}
          {i.incomeType === 'monthly' && <span className="text-[10px] text-blue-500">Monthly</span>}
          {i.incomeType === 'yearly' && <span className="text-[10px] text-blue-500">Yearly</span>}
        </div>
      ),
    },
    { key: "status", header: "Status", sortValue: (i) => i.status, render: (i) => <StatusBadge status={i.status} /> },
    { key: "issueDate", header: "Issued", sortValue: (i) => i.issueDate, render: (i) => <span className="text-xs tabular">{new Date(i.issueDate).toLocaleDateString()}</span> },
  ];

  if (isLoadingFin || isLoadingInv) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Revenue" description="Track income across all clients and invoices" />

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
          <CardTitle>Revenue by Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={invoices} rowKey={(i) => i.id} />
        </CardContent>
      </Card>
    </div>
  );
}
