import { useState } from "react";
import { Wallet, TrendingDown, CreditCard, Users, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesBarChart } from "@/components/charts/expenses-bar-chart";
import { ExpenseDonutChart } from "@/components/charts/expense-donut-chart";
import { formatCurrency } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ChartPoint, ExpenseBreakdownPoint, Expense } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const legendColorClass: Record<string, string> = {
  Payroll: "bg-electric",
  Software: "bg-violet",
  Marketing: "bg-cyan",
  Office: "bg-amber",
  Other: "bg-rose",
};

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    category: "Software",
    amount: 0,
  });

  const { data: monthlyFinancials = [], isLoading: isLoadingFin } = useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_metrics").select("*").order("orderIndex");
      if (error) throw error;
      return data as ChartPoint[];
    },
  });

  const { data: expenseBreakdown = [], isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ["expense_breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expense_breakdown").select("*");
      if (error) throw error;
      return data as ExpenseBreakdownPoint[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newExpense: Partial<Expense>) => {
      const { data, error } = await supabase.from("expenses").insert([{
        ...newExpense,
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString().split('T')[0]
      }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsDialogOpen(false);
      setFormData({ description: "", category: "Software", amount: 0 });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const totalExpenses = monthlyFinancials.reduce((sum, m) => sum + m.expenses, 0);
  const avgMonthly = monthlyFinancials.length ? totalExpenses / monthlyFinancials.length : 0;
  const latestMonth = monthlyFinancials[monthlyFinancials.length - 1] || { expenses: 0 };

  if (isLoadingFin || isLoadingBreakdown) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Expenses" 
        description="Monitor spending across categories and time" 
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" type="number" required min="0" value={formData.amount || ""} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary" type="button">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving..." : "Save Expense"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Expenses (6mo)" value={totalExpenses} prefix="₹" change={-4.2} icon={Wallet} accent="amber" />
        <KPICard label="Avg Monthly" value={avgMonthly} prefix="₹" change={2.8} icon={TrendingDown} accent="blue" />
        <KPICard label="This Month" value={latestMonth.expenses} prefix="₹" change={6.5} icon={CreditCard} accent="blue" />
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
