import { useMemo, useState } from "react";
import { Plus, Search, FileText, Download, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";

const invoiceSchema = z.object({
  client: z.string().min(2, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.coerce.number().min(1),
    rate: z.coerce.number().min(0)
  })).min(1, "At least one item is required")
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoicesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      lineItems: [{ description: "", quantity: 1, rate: 0 }],
      taxRate: 0,
      discount: 0,
      notes: "",
      issueDate: new Date().toISOString().split("T")[0],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const watchLineItems = useWatch({ control, name: "lineItems" }) || [];
  const watchTaxRate = useWatch({ control, name: "taxRate" }) || 0;
  const watchDiscount = useWatch({ control, name: "discount" }) || 0;

  const subtotal = watchLineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * watchTaxRate) / 100;
  const totalAmount = subtotal + taxAmount - watchDiscount;

  const { data: clients = [] } = useQuery({
    queryKey: ["clients_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const newInvoice = {
        id: Math.random().toString(36).substring(2, 9),
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...values,
        amount: totalAmount,
        status: "pending",
        items: values.lineItems.length,
      };
      const { error } = await supabase.from("invoices").insert([newInvoice]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsDialogOpen(false);
      reset();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: InvoiceFormValues & { id: string }) => {
      const { id, ...rest } = values;
      const { error } = await supabase.from("invoices").update({
        ...rest,
        amount: totalAmount,
        items: values.lineItems.length
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsDialogOpen(false);
      setSelectedInvoice(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Invoice["status"] }) => {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const openEditDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    reset({
      client: invoice.client,
      issueDate: invoice.issueDate || new Date().toISOString().split("T")[0],
      dueDate: invoice.dueDate.split('T')[0],
      taxRate: invoice.taxRate || 0,
      discount: invoice.discount || 0,
      notes: invoice.notes || "",
      lineItems: invoice.lineItems && invoice.lineItems.length > 0 ? invoice.lineItems : [{ description: "", quantity: 1, rate: 0 }],
    });
    setIsDialogOpen(true);
  };

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
    { 
      key: "status", 
      header: "Status", 
      sortValue: (i) => i.status, 
      render: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <StatusBadge status={i.status} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel className="text-xs font-semibold text-ink-faint">Change Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: i.id, status: "pending" })}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: i.id, status: "paid" })}>Paid</DropdownMenuItem>
            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: i.id, status: "overdue" })}>Overdue</DropdownMenuItem>
            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: i.id, status: "draft" })}>Draft</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortValue: (i) => i.dueDate,
      render: (i) => <span className="text-xs tabular">{new Date(i.dueDate).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (i) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon-sm">
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                <MoreVertical className="h-4 w-4 text-ink-faint" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(i)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteMutation.mutate(i.id)} className="text-rose focus:text-rose">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          <Button onClick={() => setIsDialogOpen(true)}>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedInvoice(null);
          reset({
            client: "",
            issueDate: new Date().toISOString().split("T")[0],
            dueDate: "",
            taxRate: 0,
            discount: 0,
            notes: "",
            lineItems: [{ description: "", quantity: 1, rate: 0 }],
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInvoice ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
            <DialogDescription>{selectedInvoice ? "Update invoice details." : "Draft a new invoice for a client."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => {
            if (selectedInvoice) {
              editMutation.mutate({ ...data, id: selectedInvoice.id });
            } else {
              createMutation.mutate(data);
            }
          })}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Client</label>
                  <Controller
                    control={control}
                    name="client"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c: any) => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.client && <p className="mt-1 text-[10px] text-rose">{errors.client.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Issue Date</label>
                  <Input type="date" {...register("issueDate")} />
                  {errors.issueDate && <p className="mt-1 text-[10px] text-rose">{errors.issueDate.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-dim">Due Date</label>
                  <Input type="date" {...register("dueDate")} />
                  {errors.dueDate && <p className="mt-1 text-[10px] text-rose">{errors.dueDate.message}</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 mt-4">
                  <label className="text-xs font-medium text-ink-dim">Line Items</label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => append({ description: "", quantity: 1, rate: 0 })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <div className="flex-1">
                        <Input placeholder="Description" {...register(`lineItems.${index}.description` as const)} />
                      </div>
                      <div className="w-24">
                        <Input type="number" placeholder="Qty" {...register(`lineItems.${index}.quantity` as const)} />
                      </div>
                      <div className="w-32">
                        <Input type="number" placeholder="Rate" {...register(`lineItems.${index}.rate` as const)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <Trash2 className="h-4 w-4 text-rose" />
                      </Button>
                    </div>
                  ))}
                  {errors.lineItems && <p className="mt-1 text-[10px] text-rose">{errors.lineItems.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-edge">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-dim">Notes</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-edge bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                      placeholder="Thank you for your business!" 
                      {...register("notes")} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-end">
                    <label className="text-xs font-medium text-ink-dim w-24 text-right">Tax Rate (%)</label>
                    <Input type="number" className="w-24" {...register("taxRate")} />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <label className="text-xs font-medium text-ink-dim w-24 text-right">Discount (₹)</label>
                    <Input type="number" className="w-24" {...register("discount")} />
                  </div>
                  <div className="flex justify-end gap-4 text-sm pt-2">
                    <div className="text-right text-ink-dim space-y-1">
                      <p>Subtotal:</p>
                      <p>Tax:</p>
                      <p>Discount:</p>
                      <p className="font-medium text-ink pt-2">Total:</p>
                    </div>
                    <div className="text-right tabular font-medium space-y-1">
                      <p>{formatCurrency(subtotal)}</p>
                      <p>{formatCurrency(taxAmount)}</p>
                      <p>-{formatCurrency(watchDiscount)}</p>
                      <p className="text-lg text-brand pt-1">{formatCurrency(totalAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="secondary" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || editMutation.isPending}>
                {createMutation.isPending || editMutation.isPending ? "Saving..." : selectedInvoice ? "Save Changes" : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
