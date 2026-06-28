import { useMemo, useState } from "react";
import { Plus, Search, Users, Mail, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/avatar";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Client } from "@/types";

const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Phone is required"),
  location: z.string().min(2, "Location is required"),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      const newClient = {
        id: Math.random().toString(36).substring(2, 9),
        ...values,
        avatarSeed: values.name.toLowerCase().replace(/\s+/g, ""),
        status: "pending",
        totalValue: 0,
        projectsCount: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        tags: ["New"],
      };
      const { error } = await supabase.from("clients").insert([newClient]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setAddOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSelected(null);
    },
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data as Client[];
    },
  });

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.company.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const columns: Column<Client>[] = [
    {
      key: "name",
      header: "Client",
      sortValue: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar seed={c.avatarSeed} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{c.name}</p>
            <p className="truncate text-xs text-ink-faint">{c.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (c) => c.status,
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "value",
      header: "Total Value",
      align: "right",
      sortValue: (c) => c.totalValue,
      render: (c) => <span className="tabular text-ink">{formatCurrency(c.totalValue)}</span>,
    },
    {
      key: "projects",
      header: "Projects",
      align: "center",
      sortValue: (c) => c.projectsCount,
      render: (c) => <span className="tabular">{c.projectsCount}</span>,
    },
    {
      key: "location",
      header: "Location",
      sortValue: (c) => c.location,
      render: (c) => <span className="text-xs">{c.location}</span>,
    },
    {
      key: "joined",
      header: "Joined",
      sortValue: (c) => c.joinedDate,
      render: (c) => <span className="text-xs tabular">{new Date(c.joinedDate).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} total clients across ${new Set(clients.map((c) => c.location)).size} locations`}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            placeholder="Search clients..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-ink-dim">Loading clients...</div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No clients found"
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery("");
              setStatusFilter("all");
            }}
          />
        </Card>
      ) : (
        <DataTable columns={columns} data={filtered} rowKey={(c) => c.id} onRowClick={setSelected} />
      )}

      {/* Add Client Drawer */}
      <Drawer open={addOpen} onOpenChange={setAddOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Client</DrawerTitle>
            <DrawerDescription>This form is a UI placeholder — no data will be saved.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Full name</label>
              <Input placeholder="Jane Cooper" {...register("name")} />
              {errors.name && <p className="mt-1 text-[10px] text-rose">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Company</label>
              <Input placeholder="Acme Corp" {...register("company")} />
              {errors.company && <p className="mt-1 text-[10px] text-rose">{errors.company.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Email</label>
              <Input placeholder="jane@acme.com" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-[10px] text-rose">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Phone</label>
              <Input placeholder="+1 (555) 000-0000" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-[10px] text-rose">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Location</label>
              <Input placeholder="New York, NY" {...register("location")} />
              {errors.location && <p className="mt-1 text-[10px] text-rose">{errors.location.message}</p>}
            </div>
            <Button className="w-full" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Client"}
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Client Detail Drawer */}
      <Drawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DrawerContent>
          {selected && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-4">
                  <Avatar seed={selected.avatarSeed} size="lg" />
                  <div>
                    <DrawerTitle>{selected.name}</DrawerTitle>
                    <DrawerDescription>{selected.company}</DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-ink-faint">
                    Joined {new Date(selected.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-ink-faint">Total Value</p>
                      <p className="mt-1 font-display text-lg font-semibold text-ink tabular">
                        {formatCurrency(selected.totalValue)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-ink-faint">Projects</p>
                      <p className="mt-1 font-display text-lg font-semibold text-ink tabular">
                        {selected.projectsCount}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-3 rounded-[var(--radius-card)] border border-edge p-4">
                  <div className="flex items-center gap-3 text-sm text-ink-dim">
                    <Mail className="h-4 w-4 text-ink-faint" /> {selected.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-dim">
                    <Phone className="h-4 w-4 text-ink-faint" /> {selected.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-dim">
                    <MapPin className="h-4 w-4 text-ink-faint" /> {selected.location}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-ink-faint">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-[var(--color-edge)]">
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(selected.id)}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Client"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
