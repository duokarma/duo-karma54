import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Edit2, Database, ArrowLeft } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import type { DynamicSchema, DynamicSchemaField, DynamicRecord } from "@/types";

// ── Dynamic Field Renderer (for the data entry form) ────────────────────────
function DynamicFieldInput({
  field,
  value,
  onChange,
}: {
  field: DynamicSchemaField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const baseClass = "w-full";

  switch (field.type) {
    case "boolean":
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={Boolean(value)}
            onCheckedChange={onChange}
          />
          <span className="text-xs text-ink-faint">{Boolean(value) ? "Yes" : "No"}</span>
        </div>
      );

    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger className={baseClass}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "textarea":
      return (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cn(
            baseClass,
            "rounded-[var(--radius-control)] border border-edge bg-charcoal px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-electric/50 focus:outline-none focus:ring-1 focus:ring-electric/30 resize-none"
          )}
          placeholder={`Enter ${field.name.toLowerCase()}...`}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={`Enter ${field.name.toLowerCase()}...`}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter email...`}
        />
      );

    case "url":
      return (
        <Input
          type="url"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      );

    default: // text
      return (
        <Input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.name.toLowerCase()}...`}
        />
      );
  }
}

// ── Format a single value for table display ──────────────────────────────────
function formatValue(value: unknown, field: DynamicSchemaField): string {
  if (value === null || value === undefined || value === "") return "—";
  switch (field.type) {
    case "boolean": return Boolean(value) ? "✅ Yes" : "❌ No";
    case "date": return new Date(String(value)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    case "number": return Number(value).toLocaleString("en-IN");
    case "url": return String(value).replace(/^https?:\/\//, "");
    default: return String(value);
  }
}

// ── Main page ────────────────────────────────────────────────────────────────
export function DynamicCollectionPage() {
  const { schemaSlug } = useParams<{ schemaSlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DynamicRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // ── Queries ──
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ["dynamic_schema_by_slug", schemaSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_schemas")
        .select("*")
        .eq("slug", schemaSlug)
        .single();
      if (error) throw error;
      return data as DynamicSchema;
    },
    enabled: !!schemaSlug,
  });

  const { data: fields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ["dynamic_schema_fields", schema?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_schema_fields")
        .select("*")
        .eq("schema_id", schema!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DynamicSchemaField[];
    },
    enabled: !!schema?.id,
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["dynamic_records", schema?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_records")
        .select("*")
        .eq("schema_id", schema!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DynamicRecord[];
    },
    enabled: !!schema?.id,
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase
        .from("dynamic_records")
        .insert([{ schema_id: schema!.id, data }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_records", schema?.id] });
      setFormOpen(false);
      setFormData({});
      toast({ title: "Record added!", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("dynamic_records")
        .update({ data })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_records", schema?.id] });
      setFormOpen(false);
      setDetailOpen(false);
      setFormData({});
      setSelectedRecord(null);
      toast({ title: "Record updated!", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dynamic_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_records", schema?.id] });
      setDetailOpen(false);
      setSelectedRecord(null);
      toast({ title: "Record deleted", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  // ── Open the add form ──
  const openAddForm = useCallback(() => {
    setSelectedRecord(null);
    setFormData({});
    setFormOpen(true);
  }, []);

  // ── Open the edit form ──
  const openEditForm = useCallback((record: DynamicRecord) => {
    setSelectedRecord(record);
    setFormData({ ...record.data });
    setDetailOpen(false);
    setFormOpen(true);
  }, []);

  // ── Click a row ──
  const openDetail = useCallback((record: DynamicRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  }, []);

  // ── Filter records ──
  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    return Object.values(r.data).some((v) =>
      String(v ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  // ── Build columns dynamically from fields ──
  const columns: Column<DynamicRecord>[] = fields.map((field, i) => ({
    key: field.slug,
    header: field.name,
    sortValue: (r) => String(r.data[field.slug] ?? ""),
    // Show first 2 columns more prominently
    render: (r) => (
      <span
        className={cn(
          "text-sm",
          i === 0 ? "font-medium text-ink" : "text-ink-dim",
          field.type === "boolean" && "text-base"
        )}
      >
        {formatValue(r.data[field.slug], field)}
      </span>
    ),
  }));

  // Add a created_at column at the end
  columns.push({
    key: "created_at",
    header: "Added",
    sortValue: (r) => r.created_at,
    render: (r) => (
      <span className="text-xs text-ink-faint tabular">
        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
      </span>
    ),
  });

  const isLoading = schemaLoading || fieldsLoading || recordsLoading;

  if (!schema && !schemaLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-ink-faint">Section not found.</p>
        <Button variant="ghost" onClick={() => navigate("/admin/schema-builder")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Schema Builder
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={schema?.name ?? "Loading..."}
        description={
          schema
            ? `${records.length} ${records.length === 1 ? "record" : "records"} · ${fields.length} fields`
            : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/schema-builder")}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Fields
            </Button>
            <Button onClick={openAddForm} disabled={!schema || fields.length === 0}>
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </div>
        }
      />

      {/* Search bar */}
      {records.length > 0 && (
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input
              placeholder={`Search ${schema?.name ?? "records"}...`}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* No fields warning */}
      {!isLoading && schema && fields.length === 0 && (
        <Card>
          <EmptyState
            icon={Database}
            title="No fields defined yet"
            description={`Go to Schema Builder to add fields to "${schema.name}" first, then come back to add records.`}
            actionLabel="Open Schema Builder"
            onAction={() => navigate("/admin/schema-builder")}
          />
        </Card>
      )}

      {/* Records table */}
      {fields.length > 0 && (
        isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-[var(--radius-card)] bg-white/[0.04]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={Database}
              title={search ? "No results found" : `No ${schema?.name ?? "records"} yet`}
              description={
                search
                  ? "Try a different search term."
                  : "Click 'Add Record' to add your first entry."
              }
              actionLabel={search ? "Clear search" : "Add Record"}
              onAction={search ? () => setSearch("") : openAddForm}
            />
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(r) => r.id}
            onRowClick={openDetail}
          />
        )
      )}

      {/* ── Add / Edit Record Drawer ── */}
      <Drawer open={formOpen} onOpenChange={(open) => {
        setFormOpen(open);
        if (!open) { setFormData({}); setSelectedRecord(null); }
      }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedRecord ? `Edit Record` : `Add to ${schema?.name ?? "Section"}`}
            </DrawerTitle>
            <DrawerDescription>
              Fill in the fields below and hit save.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">
                  {field.name}
                  {field.is_required && <span className="ml-1 text-rose">*</span>}
                </label>
                <DynamicFieldInput
                  field={field}
                  value={formData[field.slug]}
                  onChange={(v) => setFormData((prev) => ({ ...prev, [field.slug]: v }))}
                />
              </div>
            ))}

            <Button
              className="w-full"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                // Validate required fields
                const missing = fields
                  .filter((f) => f.is_required && !formData[f.slug] && formData[f.slug] !== false)
                  .map((f) => f.name);
                if (missing.length > 0) {
                  toast({
                    title: "Required fields missing",
                    description: missing.join(", "),
                    variant: "error",
                  });
                  return;
                }
                if (selectedRecord) {
                  updateMutation.mutate({ id: selectedRecord.id, data: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : selectedRecord
                ? "Update Record"
                : "Save Record"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Record Detail Drawer ── */}
      <Drawer open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) setSelectedRecord(null);
      }}>
        <DrawerContent>
          {selectedRecord && (
            <>
              <DrawerHeader>
                <DrawerTitle>Record Details</DrawerTitle>
                <DrawerDescription>
                  Added {new Date(selectedRecord.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-3">
                {fields.map((field) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-0.5 rounded-[var(--radius-control)] bg-white/[0.03] px-3 py-2.5 border border-edge"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                      {field.name}
                    </span>
                    <span className="text-sm text-ink">
                      {formatValue(selectedRecord.data[field.slug], field)}
                    </span>
                  </motion.div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => openEditForm(selectedRecord)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm("Delete this record?")) {
                        deleteMutation.mutate(selectedRecord.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
