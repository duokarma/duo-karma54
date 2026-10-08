import { useState, useMemo } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, Wallet, TrendingUp, TrendingDown, CheckCircle2,
  Clock, Plus, Pencil, Trash2, MoreVertical, Loader2,
  ReceiptText, Percent, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Client, ChartPoint, Expense } from "@/types";

const TABS = [
  { key: "payments", label: "Payments",  icon: IndianRupee },
  { key: "expenses", label: "Expenses",  icon: Wallet },
  { key: "summary",  label: "Summary",   icon: TrendingUp },
] as const;
type Tab = (typeof TABS)[number]["key"];

const EXPENSE_CATEGORIES = [
  "Software", "Travel", "Office", "Tools", "Marketing", "Food", "Utilities", "Other",
];

// ── Payments Tab ──────────────────────────────────────────────────────────────
function PaymentsTab({ clients }: { clients: Client[] }) {
  const qc  = useQueryClient();
  const { toast } = useToast();

  const markPayment = async (client: Client, field: "advance" | "full") => {
    const updates =
      field === "full"
        ? { advance_paid: client.totalValue, remaining_amount: 0, amountPaid: client.totalValue }
        : { advance_paid: (client as any).advance_paid || Math.round((client.totalValue || 0) / 2) };
    await supabase.from("clients").update(updates).eq("id", client.id);
    qc.invalidateQueries({ queryKey: ["clients"] });
    toast({ title: field === "full" ? "Marked fully paid" : "Advance updated" });
  };

  const sorted = useMemo(
    () => [...clients].sort((a, b) => {
      const aRem = Math.max(0, (a.totalValue ?? 0) - ((a as any).advance_paid ?? 0));
      const bRem = Math.max(0, (b.totalValue ?? 0) - ((b as any).advance_paid ?? 0));
      return bRem - aRem; // pending amounts first
    }),
    [clients]
  );

  if (!clients.length) {
    return (
      <div className="py-16 text-center text-ink/40 text-sm">
        No clients yet. Add clients from the Pipeline page.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((client, i) => {
        const totalValue   = client.totalValue ?? 0;
        const advancePaid  = (client as any).advance_paid ?? 0;
        const remaining    = Math.max(0, totalValue - advancePaid);
        const gstApplicable = (client as any).gst_applicable;
        const gstAmount    = (client as any).gst_amount ?? 0;
        const commission   = (client as any).commission_applicable;
        const commAmount   = (client as any).commission_amount ?? 0;
        const commPaid     = (client as any).commission_paid;
        const commTo       = (client as any).commission_to ?? "";
        const pct          = totalValue > 0 ? Math.round((advancePaid / totalValue) * 100) : 0;

        return (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Client info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-ink">{client.name}</p>
                    <StatusBadge status={client.status} />
                    {gstApplicable && (
                      <span className="text-[10px] border border-blue-500/30 text-blue-400 rounded px-1.5 py-0.5 flex items-center gap-1">
                        <ReceiptText className="h-2.5 w-2.5" /> GST
                      </span>
                    )}
                    {commission && (
                      <span className={`text-[10px] border rounded px-1.5 py-0.5 flex items-center gap-1 ${commPaid ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"}`}>
                        <Percent className="h-2.5 w-2.5" /> Commission {commPaid ? "✓" : "Pending"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/50">{client.company}</p>
                  <p className="text-[10px] text-ink/35 capitalize">{client.incomeType ?? "one-time"}</p>
                </div>

                {/* Payment amounts */}
                <div className="flex flex-col gap-1.5 sm:items-end">
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-ink/40">Total Value</p>
                      <p className="text-sm font-bold text-ink tabular">{formatCurrency(totalValue)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-ink/40">Advance Paid</p>
                      <p className="text-sm font-medium text-emerald-400 tabular">{formatCurrency(advancePaid)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-ink/40">Remaining</p>
                      <p className={`text-sm font-medium tabular ${remaining > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {remaining > 0 ? formatCurrency(remaining) : "✓ Paid"}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-full sm:w-48">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-ink/40 shrink-0">{pct}%</span>
                  </div>

                  {/* GST row */}
                  {gstApplicable && gstAmount > 0 && (
                    <p className="text-[10px] text-blue-400">GST: {formatCurrency(gstAmount)}</p>
                  )}

                  {/* Commission row */}
                  {commission && commAmount > 0 && (
                    <p className={`text-[10px] ${commPaid ? "text-emerald-400" : "text-amber-400"}`}>
                      Commission {commPaid ? "paid" : "due"}: {formatCurrency(commAmount)} → {commTo}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {remaining > 0 && (
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7 px-2"
                      onClick={() => markPayment(client, "advance")}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Advance
                    </Button>
                    <Button
                      size="sm"
                      className="text-[11px] h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => markPayment(client, "full")}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Full Payment
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Expenses Tab ──────────────────────────────────────────────────────────────
function ExpensesTab({ expenses }: { expenses: Expense[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState({ description: "", category: "Software", amount: 0, date: new Date().toISOString().slice(0, 10) });

  const openNew = () => {
    setEditingExpense(null);
    setForm({ description: "", category: "Software", amount: 0, date: new Date().toISOString().slice(0, 10) });
    setDialogOpen(true);
  };
  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({ description: expense.description, category: expense.category, amount: expense.amount, date: expense.date });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingExpense) {
        const { error } = await supabase.from("expenses").update(form).eq("id", editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert({ ...form, id: `exp_${Date.now()}` });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: editingExpense ? "Expense updated" : "Expense added" });
      setDialogOpen(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("expenses").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense deleted" });
    },
  });

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.category] = (map[e.category] ?? 0) + e.amount;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink/50">
          Total expenses: <span className="font-semibold text-ink">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
        </p>
        <Button size="sm" className="gap-1.5 text-xs h-8" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> Add Expense
        </Button>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {byCategory.map(([cat, total]) => (
            <span key={cat} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink/70">
              {cat} <span className="text-ink font-medium">{formatCurrency(total)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expense list */}
      <div className="space-y-2">
        {expenses.length === 0 && (
          <div className="py-12 text-center text-ink/40 text-sm">No expenses recorded yet.</div>
        )}
        {expenses.map((exp, i) => (
          <motion.div key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
            <Card className="px-4 py-3 flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5 text-ink/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{exp.description}</p>
                <p className="text-[10px] text-ink/40">{exp.category} · {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <p className="text-sm font-bold text-ink tabular shrink-0">{formatCurrency(exp.amount)}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-ink/30 hover:text-ink/70 rounded">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(exp)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => deleteMutation.mutate(exp.id)}>
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit expense dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="field-label">Description</label>
              <Input placeholder="What was this for?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="field-label">Amount (₹)</label>
                <Input type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: +e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="field-label">Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Summary Tab ───────────────────────────────────────────────────────────────
function SummaryTab({
  clients,
  expenses,
  financials,
}: {
  clients: Client[];
  expenses: Expense[];
  financials: ChartPoint[];
}) {
  const totalRevenue    = clients.reduce((s, c) => s + (c.totalValue ?? 0), 0);
  const totalCollected  = clients.reduce((s, c) => s + ((c as any).advance_paid ?? 0), 0);
  const totalPending    = totalRevenue - totalCollected;
  const totalExpenses   = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit       = totalCollected - totalExpenses;
  const totalGST        = clients.filter((c) => (c as any).gst_applicable).reduce((s, c) => s + ((c as any).gst_amount ?? 0), 0);
  const totalCommission = clients.filter((c) => (c as any).commission_applicable).reduce((s, c) => s + ((c as any).commission_amount ?? 0), 0);
  const unpaidCommission = clients.filter((c) => (c as any).commission_applicable && !(c as any).commission_paid).reduce((s, c) => s + ((c as any).commission_amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Contracted" value={formatCurrency(totalRevenue)} icon={IndianRupee} color="#6366F1" />
        <SummaryCard label="Total Collected" value={formatCurrency(totalCollected)} icon={CheckCircle2} color="#10B981" />
        <SummaryCard label="Still Pending" value={formatCurrency(totalPending)} icon={Clock} color="#F59E0B" />
        <SummaryCard label="Net Profit" value={formatCurrency(netProfit)} icon={TrendingUp} color={netProfit >= 0 ? "#10B981" : "#EF4444"} />
      </div>

      {/* Special rows */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <ReceiptText className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-ink/50">GST Total</p>
            <p className="text-sm font-bold text-blue-400">{formatCurrency(totalGST)}</p>
            <p className="text-[10px] text-ink/30">{clients.filter((c) => (c as any).gst_applicable).length} GST project(s)</p>
          </div>
        </Card>
        <Card className="px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Percent className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-ink/50">Total Commissions</p>
            <p className="text-sm font-bold text-amber-400">{formatCurrency(totalCommission)}</p>
            <p className="text-[10px] text-ink/30">{unpaidCommission > 0 ? `${formatCurrency(unpaidCommission)} unpaid` : "All paid ✓"}</p>
          </div>
        </Card>
        <Card className="px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div>
            <p className="text-[10px] text-ink/50">Total Expenses</p>
            <p className="text-sm font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          </div>
        </Card>
      </div>

      {/* Revenue & Profit chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Profit (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          {financials.length === 0 ? (
            <div className="flex items-center gap-2 text-ink/40 text-sm py-8 justify-center">
              <AlertCircle className="h-4 w-4" />
              No financial data yet. Add expenses and client payments to see trends.
            </div>
          ) : (
            <FinancialsAreaChart data={financials} height={280} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <Card className="px-4 py-3.5 flex items-center gap-3">
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] text-ink/50">{label}</p>
        <p className="text-base font-bold text-ink" style={{ color }}>{value}</p>
      </div>
    </Card>
  );
}

// ── Main Finance Page ─────────────────────────────────────────────────────────
export function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("payments");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*");
      return (data ?? []) as Client[];
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("*").order("date", { ascending: false });
      return (data ?? []) as Expense[];
    },
  });

  const { data: financials = [] } = useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("financial_metrics").select("*").order("orderIndex");
      return (data ?? []) as ChartPoint[];
    },
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Finance" description="Payments, expenses, and your profit summary" />

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-white/10 bg-white/3 p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-white/10 text-white shadow-sm"
                : "text-ink/50 hover:text-ink/80"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "payments" && <PaymentsTab clients={clients} />}
          {activeTab === "expenses" && <ExpensesTab expenses={expenses} />}
          {activeTab === "summary"  && <SummaryTab clients={clients} expenses={expenses} financials={financials} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
