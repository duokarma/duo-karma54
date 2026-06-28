import { DollarSign, TrendingUp, Receipt, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { monthlyFinancials } from "@/data/misc";
import { invoices } from "@/data/invoices";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";

export function RevenuePage() {
  const totalRevenue = monthlyFinancials.reduce((sum, m) => sum + m.revenue, 0);
  const avgMonthly = totalRevenue / monthlyFinancials.length;
  const paidRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  const columns: Column<Invoice>[] = [
    { key: "invoiceNumber", header: "Invoice", sortValue: (i) => i.invoiceNumber, render: (i) => <span className="font-medium text-ink">{i.invoiceNumber}</span> },
    { key: "client", header: "Client", sortValue: (i) => i.client, render: (i) => i.client },
    { key: "amount", header: "Amount", align: "right", sortValue: (i) => i.amount, render: (i) => <span className="tabular text-ink">{formatCurrency(i.amount)}</span> },
    { key: "status", header: "Status", sortValue: (i) => i.status, render: (i) => <StatusBadge status={i.status} /> },
    { key: "issueDate", header: "Issued", sortValue: (i) => i.issueDate, render: (i) => <span className="text-xs tabular">{new Date(i.issueDate).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Revenue" description="Track income across all clients and invoices" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Revenue (6mo)" value={totalRevenue} prefix="$" change={14.6} icon={DollarSign} accent="blue" />
        <KPICard label="Avg Monthly" value={avgMonthly} prefix="$" change={8.2} icon={TrendingUp} accent="green" />
        <KPICard label="Collected" value={paidRevenue} prefix="$" change={5.4} icon={Receipt} accent="blue" />
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
