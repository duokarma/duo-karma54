import { useMemo, useState } from "react";
import { Plus, Search, FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";

const invoiceSchema = z.object({
  client: z.string().min(2, "Client is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoicesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
  });

  const createMutation = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const newInvoice = {
        id: Math.random().toString(36).substring(2, 9),
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...values,
        status: "pending",
        issueDate: new Date().toISOString().split("T")[0],
        items: 1,
      };
      const { error } = await supabase.from("invoices").insert([newInvoice]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setCreateOpen(false);
      reset();
    },
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*");
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        inv.client.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, statusFilter]);

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      sortValue: (i) => i.invoiceNumber,
      render: (i) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-ink-faint" />
          <span className="font-medium text-ink">{i.invoiceNumber}</span>
        </div>
      ),
    },
    { key: "client", header: "Client", sortValue: (i) => i.client, render: (i) => i.client },
    { key: "items", header: "Items", align: "center", sortValue: (i) => i.items, render: (i) => <span className="tabular">{i.items}</span> },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortValue: (i) => i.amount,
      render: (i) => <span className="tabular font-medium text-ink">{formatCurrency(i.amount)}</span>,
    },
    { key: "status", header: "Status", sortValue: (i) => i.status, render: (i) => <StatusBadge status={i.status} /> },
    {
      key: "dueDate",
      header: "Due Date",
      sortValue: (i) => i.dueDate,
      render: (i) => <span className="text-xs tabular">{new Date(i.dueDate).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <Button variant="ghost" size="icon-sm">
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const totals = {
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${invoices.length} invoices · ${formatCurrency(totals.paid)} collected this period`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-ink-faint">Paid</p>
          <p className="mt-1 font-display text-lg font-semibold text-emerald tabular">{formatCurrency(totals.paid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-faint">Pending</p>
          <p className="mt-1 font-display text-lg font-semibold text-amber tabular">{formatCurrency(totals.pending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-faint">Overdue</p>
          <p className="mt-1 font-display text-lg font-semibold text-rose tabular">{formatCurrency(totals.overdue)}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input placeholder="Search invoices..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-ink-dim">Loading invoices...</div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Try adjusting your search or filters."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery("");
              setStatusFilter("all");
            }}
          />
        </Card>
      ) : (
        <DataTable columns={columns} data={filtered} rowKey={(i) => i.id} />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Draft a new invoice for a client.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Client</label>
                <Input placeholder="Select or type client name" {...register("client")} />
                {errors.client && <p className="mt-1 text-[10px] text-rose">{errors.client.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Amount</label>
                <Input placeholder="5000" type="number" {...register("amount")} />
                {errors.amount && <p className="mt-1 text-[10px] text-rose">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">Due date</label>
                <Input type="date" {...register("dueDate")} />
                {errors.dueDate && <p className="mt-1 text-[10px] text-rose">{errors.dueDate.message}</p>}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
