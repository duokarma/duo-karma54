import { Wallet, TrendingDown, CreditCard, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesBarChart } from "@/components/charts/expenses-bar-chart";
import { ExpenseDonutChart } from "@/components/charts/expense-donut-chart";
import { monthlyFinancials, expenseBreakdown } from "@/data/misc";
import { formatCurrency } from "@/lib/utils";

const legendColorClass: Record<string, string> = {
  Payroll: "bg-electric",
  Software: "bg-violet",
  Marketing: "bg-cyan",
  Office: "bg-amber",
  Other: "bg-rose",
};

export function ExpensesPage() {
  const totalExpenses = monthlyFinancials.reduce((sum, m) => sum + m.expenses, 0);
  const avgMonthly = totalExpenses / monthlyFinancials.length;
  const latestMonth = monthlyFinancials[monthlyFinancials.length - 1];

  return (
    <div>
      <PageHeader title="Expenses" description="Monitor spending across categories and time" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Expenses (6mo)" value={totalExpenses} prefix="$" change={-4.2} icon={Wallet} accent="amber" />
        <KPICard label="Avg Monthly" value={avgMonthly} prefix="$" change={2.8} icon={TrendingDown} accent="blue" />
        <KPICard label="This Month" value={latestMonth.expenses} prefix="$" change={6.5} icon={CreditCard} accent="blue" />
        <KPICard label="Payroll Share" value={58.6} suffix="%" change={1.2} icon={Users} accent="green" decimals={1} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesBarChart data={monthlyFinancials} height={320} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseDonutChart data={expenseBreakdown} height={200} />
            <div className="mt-4 space-y-2.5">
              {expenseBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${legendColorClass[item.label] ?? "bg-ink-faint"}`} />
                    <span className="text-ink-dim">{item.label}</span>
                  </div>
                  <span className="tabular text-ink">{formatCurrency(item.value, true)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
