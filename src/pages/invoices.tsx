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
import { invoices } from "@/data/invoices";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";

export function InvoicesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        inv.client.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

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

      {filtered.length === 0 ? (
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
            <DialogDescription>This is a UI placeholder — invoice creation isn't wired up yet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Client</label>
              <Input placeholder="Select or type client name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Amount</label>
              <Input placeholder="$0.00" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Due date</label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
