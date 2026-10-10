import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Database,
  ArrowLeft,
  Settings,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
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
import { logActivity } from "@/lib/activity-logger";
import type { DynamicSchema, DynamicSchemaField, DynamicRecord, FieldType } from "@/types";

// ── Icon picker options ────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  "Database", "Users", "Star", "Heart", "Briefcase", "ShoppingCart",
  "Package", "Tag", "FileText", "BarChart3", "Layers", "Globe",
  "Building2", "Truck", "Zap", "Target", "BookOpen", "Award",
  "Calendar", "Camera", "Music", "Coffee", "Gift", "Home",
];

const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
  { value: "text",     label: "Short Text",    description: "Single-line text input" },
  { value: "textarea", label: "Long Text",      description: "Multi-line text area" },
  { value: "number",   label: "Number",         description: "Numeric value" },
  { value: "email",    label: "Email",          description: "Valid email address" },
  { value: "url",      label: "URL / Link",     description: "Website URL" },
  { value: "date",     label: "Date",           description: "Date picker" },
  { value: "boolean",  label: "Yes / No",       description: "Toggle switch" },
  { value: "select",   label: "Dropdown",       description: "Pick from options you define" },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function renderIconComponent(name: string, className?: string) {
  const icons: Record<string, React.ReactNode> = {
    Database: <Database className={className} />,
    Users: <span className={cn("inline-flex items-center justify-center", className)}>👥</span>,
    Star: <span className={cn("inline-flex items-center justify-center", className)}>⭐</span>,
    Heart: <span className={cn("inline-flex items-center justify-center", className)}>❤️</span>,
    Briefcase: <span className={cn("inline-flex items-center justify-center", className)}>💼</span>,
    ShoppingCart: <span className={cn("inline-flex items-center justify-center", className)}>🛒</span>,
    Package: <span className={cn("inline-flex items-center justify-center", className)}>📦</span>,
    Tag: <span className={cn("inline-flex items-center justify-center", className)}>🏷️</span>,
    FileText: <span className={cn("inline-flex items-center justify-center", className)}>📄</span>,
    BarChart3: <span className={cn("inline-flex items-center justify-center", className)}>📊</span>,
    Layers: <span className={cn("inline-flex items-center justify-center", className)}>🗂️</span>,
    Globe: <span className={cn("inline-flex items-center justify-center", className)}>🌍</span>,
    Building2: <span className={cn("inline-flex items-center justify-center", className)}>🏢</span>,
    Truck: <span className={cn("inline-flex items-center justify-center", className)}>🚚</span>,
    Zap: <span className={cn("inline-flex items-center justify-center", className)}>⚡</span>,
    Target: <span className={cn("inline-flex items-center justify-center", className)}>🎯</span>,
    BookOpen: <span className={cn("inline-flex items-center justify-center", className)}>📖</span>,
    Award: <span className={cn("inline-flex items-center justify-center", className)}>🏆</span>,
    Calendar: <span className={cn("inline-flex items-center justify-center", className)}>📅</span>,
    Camera: <span className={cn("inline-flex items-center justify-center", className)}>📷</span>,
    Music: <span className={cn("inline-flex items-center justify-center", className)}>🎵</span>,
    Coffee: <span className={cn("inline-flex items-center justify-center", className)}>☕</span>,
    Gift: <span className={cn("inline-flex items-center justify-center", className)}>🎁</span>,
    Home: <span className={cn("inline-flex items-center justify-center", className)}>🏠</span>,
  };
  return icons[name] ?? <Database className={className} />;
}

// ── Dynamic Field Renderer (for data entry form) ────────────────────────────
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
          placeholder="email@example.com"
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

// ── Main Page Component ──────────────────────────────────────────────────────
export function DynamicCollectionPage() {
  const { schemaSlug } = useParams<{ schemaSlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [alterSchemaOpen, setAlterSchemaOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<DynamicRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Alter schema local state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("Database");
  const [editFields, setEditFields] = useState<Array<Partial<DynamicSchemaField> & { _tempId: string }>>([]);

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

  // Open the Alter Schema Drawer populated with current fields
  const openAlterDrawer = useCallback(() => {
    if (!schema) return;
    setEditName(schema.name);
    setEditDesc(schema.description || "");
    setEditIcon(schema.icon || "Database");
    setEditFields(fields.map((f) => ({ ...f, _tempId: f.id })));
    setAlterSchemaOpen(true);
  }, [schema, fields]);

  // ── Record Mutations ──
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase
        .from("dynamic_records")
        .insert([{ schema_id: schema!.id, data }]);
      if (error) throw error;
      logActivity({
        type: "project",
        message: `New entry added in section "${schema!.name}"`,
      });
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
      logActivity({
        type: "project",
        message: `Entry updated in section "${schema!.name}"`,
      });
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
      logActivity({
        type: "project",
        message: `Entry deleted from section "${schema!.name}"`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_records", schema?.id] });
      setDetailOpen(false);
      setSelectedRecord(null);
      toast({ title: "Record deleted", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const clearAllRecordsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("dynamic_records")
        .delete()
        .eq("schema_id", schema!.id);
      if (error) throw error;
      logActivity({
        type: "project",
        message: `Wiped all entries in section "${schema!.name}"`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_records", schema?.id] });
      toast({ title: "All records cleared", description: "All records deleted, section preserved.", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Failed to clear records", description: e.message, variant: "destructive" }),
  });

  // ── Schema Alteration Mutations ──
  const alterSchemaMutation = useMutation({
    mutationFn: async () => {
      if (!schema) return;
      const { error: schemaError } = await supabase
        .from("dynamic_schemas")
        .update({
          name: editName,
          description: editDesc,
          icon: editIcon,
        })
        .eq("id", schema.id);
      if (schemaError) throw schemaError;

      // Re-insert modified fields
      await supabase.from("dynamic_schema_fields").delete().eq("schema_id", schema.id);
      const toInsert = editFields
        .filter((f) => f.name && f.type)
        .map((f, i) => {
          const field: any = {
            schema_id: schema.id,
            name: f.name!,
            slug: f.slug || slugify(f.name!),
            type: f.type!,
            is_required: f.is_required ?? false,
            sort_order: i,
          };
          if (f.options && f.options.length > 0) {
            field.options = f.options;
          }
          return field;
        });

      if (toInsert.length > 0) {
        const { error: fieldsError } = await supabase.from("dynamic_schema_fields").insert(toInsert);
        if (fieldsError) throw fieldsError;
      }

      logActivity({
        type: "project",
        message: `Altered schema definition for "${editName}"`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_by_slug", schemaSlug] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields", schema?.id] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schemas"] });
      setAlterSchemaOpen(false);
      toast({ title: "Schema altered successfully!", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error altering schema", description: e.message, variant: "error" }),
  });

  const deleteEntireSchemaMutation = useMutation({
    mutationFn: async () => {
      if (!schema) return;
      const { error } = await supabase.from("dynamic_schemas").delete().eq("id", schema.id);
      if (error) throw error;
      logActivity({
        type: "project",
        message: `Section "${schema.name}" permanently deleted`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schemas"] });
      toast({ title: "Section permanently deleted", variant: "success" });
      navigate("/admin/schema-builder");
    },
    onError: (e: any) => toast({ title: "Failed to delete section", description: e.message, variant: "destructive" }),
  });

  // ── Form handlers ──
  const openAddForm = useCallback(() => {
    setSelectedRecord(null);
    setFormData({});
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((record: DynamicRecord) => {
    setSelectedRecord(record);
    setFormData({ ...record.data });
    setDetailOpen(false);
    setFormOpen(true);
  }, []);

  const openDetail = useCallback((record: DynamicRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  }, []);

  // Filter records
  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      Object.values(r.data).some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [records, search]);

  // Build dynamic table columns
  const columns: Column<DynamicRecord>[] = useMemo(() => {
    const fieldCols: Column<DynamicRecord>[] = fields.map((field, i) => ({
      key: field.slug,
      header: field.name,
      sortValue: (r) => String(r.data[field.slug] ?? ""),
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

    // Date column
    fieldCols.push({
      key: "created_at",
      header: "Created",
      sortValue: (r) => r.created_at,
      render: (r) => (
        <span className="text-xs text-ink-faint">
          {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
        </span>
      ),
    });

    return fieldCols;
  }, [fields]);

  const isLoading = schemaLoading || fieldsLoading || recordsLoading;

  if (!schema && !schemaLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-ink-faint">Section not found or was removed.</p>
        <Button variant="ghost" onClick={() => navigate("/admin/schema-builder")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Schema Builder
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={schema?.name ?? "Custom Section"}
        description={
          schema
            ? `${records.length} ${records.length === 1 ? "record" : "records"} stored · ${fields.length} columns defined`
            : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Alter Schema button - Maximum Alteration Power */}
            <Button
              variant="outline"
              size="sm"
              onClick={openAlterDrawer}
              className="border-white/10 hover:bg-white/5 text-xs gap-1.5"
            >
              <Settings className="h-3.5 w-3.5 text-blue-400" />
              <span>Alter Schema</span>
            </Button>

            {/* Clear All Records */}
            {records.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm(`Wipe all ${records.length} records in "${schema?.name}"? The columns structure will remain intact.`)) {
                    clearAllRecordsMutation.mutate();
                  }
                }}
                disabled={clearAllRecordsMutation.isPending}
                className="border-white/10 hover:bg-white/5 text-xs text-ink-faint hover:text-white gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Data</span>
              </Button>
            )}

            {/* Add Record */}
            <Button
              onClick={openAddForm}
              disabled={!schema || fields.length === 0}
              className="text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Record</span>
            </Button>
          </div>
        }
      />

      {/* Search bar */}
      {records.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input
              placeholder={`Search in ${schema?.name ?? "records"}...`}
              className="pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="text-xs text-ink-faint shrink-0">
            Showing {filtered.length} of {records.length}
          </span>
        </div>
      )}

      {/* No fields defined warning */}
      {!isLoading && schema && fields.length === 0 && (
        <Card className="p-6">
          <EmptyState
            icon={Database}
            title="No fields defined yet"
            description={`Define fields for "${schema.name}" so you can start adding structured records.`}
            actionLabel="Add Fields Now"
            onAction={openAlterDrawer}
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
          <Card className="p-6">
            <EmptyState
              icon={Database}
              title={search ? "No results found" : `No records in ${schema?.name ?? "this section"}`}
              description={
                search
                  ? "Try searching for a different keyword."
                  : "Click 'Add Record' above to insert your first data entry."
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
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>
              {selectedRecord ? `Edit Entry in ${schema?.name}` : `New Entry in ${schema?.name}`}
            </DrawerTitle>
            <DrawerDescription>
              Fill out the fields defined in this schema and save.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 overflow-y-auto max-h-[70vh] px-1 pb-4 custom-scrollbar">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="mb-1.5 block text-xs font-medium text-ink-dim">
                  {field.name}
                  {field.is_required && <span className="ml-1 text-rose-400">*</span>}
                </label>
                <DynamicFieldInput
                  field={field}
                  value={formData[field.slug]}
                  onChange={(v) => setFormData((prev) => ({ ...prev, [field.slug]: v }))}
                />
              </div>
            ))}

            <Button
              className="w-full h-10 mt-2"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
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
                ? "Update Entry"
                : "Save Entry"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Record Detail Preview Drawer ── */}
      <Drawer open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) setSelectedRecord(null);
      }}>
        <DrawerContent className="max-h-[90vh]">
          {selectedRecord && (
            <>
              <DrawerHeader>
                <DrawerTitle>Entry Details</DrawerTitle>
                <DrawerDescription>
                  Recorded {new Date(selectedRecord.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-3 overflow-y-auto max-h-[70vh] px-1 pb-4 custom-scrollbar">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-0.5 rounded-[var(--radius-control)] bg-white/[0.03] px-3.5 py-2.5 border border-edge"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                      {field.name}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {formatValue(selectedRecord.data[field.slug], field)}
                    </span>
                  </div>
                ))}

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/5"
                    onClick={() => openEditForm(selectedRecord)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Edit Entry
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm("Delete this entry permanently?")) {
                        deleteMutation.mutate(selectedRecord.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete Entry"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* ── In-Place Alter Schema Drawer (Maximum Alteration Power) ── */}
      <Drawer open={alterSchemaOpen} onOpenChange={setAlterSchemaOpen}>
        <DrawerContent className="max-h-[92vh]">
          {schema && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-edge text-2xl shadow-sm shrink-0">
                    {renderIconComponent(editIcon)}
                  </div>
                  <div>
                    <DrawerTitle>Alter "{schema.name}" Schema</DrawerTitle>
                    <DrawerDescription>
                      Full alteration power: add, rename, change types, or delete fields without leaving this section.
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <div className="space-y-6 overflow-y-auto max-h-[72vh] px-1 pb-4 custom-scrollbar">
                {/* General Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-dim">Section Name *</label>
                    <Input
                      placeholder="e.g. Products, Suppliers..."
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-dim">Description</label>
                    <Input
                      placeholder="What is this section for?"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-ink-dim">Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setEditIcon(icon)}
                          title={icon}
                          className={cn(
                            "relative flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all",
                            editIcon === icon
                              ? "border-electric bg-electric/20 shadow-[0_0_8px_rgba(96,165,250,0.4)]"
                              : "border-edge bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
                          )}
                        >
                          {renderIconComponent(icon, "h-4 w-4")}
                          {editIcon === icon && (
                            <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-electric">
                              <Check className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fields Editor */}
                <div className="space-y-3 pt-4 border-t border-edge/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Fields Structure</h4>
                      <p className="text-[11px] text-ink-faint">{editFields.length} columns configured</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => setEditFields([...editFields, { _tempId: crypto.randomUUID(), name: "", type: "text", is_required: false }])}
                      className="text-xs h-8 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Field
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence>
                      {editFields.map((field, i) => (
                        <div
                          key={field._tempId}
                          className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-edge bg-white/[0.03] p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-ink-faint">
                              {i + 1}
                            </span>
                            <Input
                              placeholder="Field name"
                              value={field.name ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditFields(editFields.map((f) => f._tempId === field._tempId ? { ...f, name: val, slug: slugify(val) } : f));
                              }}
                              className="flex-1 text-sm"
                            />
                            <Select
                              value={field.type ?? "text"}
                              onValueChange={(val) => {
                                setEditFields(editFields.map((f) => f._tempId === field._tempId ? { ...f, type: val as FieldType } : f));
                              }}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((ft) => (
                                  <SelectItem key={ft.value} value={ft.value}>
                                    {ft.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => setEditFields(editFields.filter((f) => f._tempId !== field._tempId))}
                              className="p-1.5 rounded text-ink-faint hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete field"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {field.type === "select" && (
                            <div className="pl-7 space-y-1">
                              <label className="text-[10px] text-ink-faint uppercase font-medium">Dropdown options (comma separated)</label>
                              <Input
                                placeholder="Option 1, Option 2, Option 3"
                                value={field.options?.join(", ") ?? ""}
                                onChange={(e) => {
                                  const opts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                  setEditFields(editFields.map((f) => f._tempId === field._tempId ? { ...f, options: opts } : f));
                                }}
                                className="text-xs"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between pl-7 text-xs text-ink-faint">
                            <span className="font-mono text-[10px]">Slug: {field.slug || slugify(field.name || "")}</span>
                            <div className="flex items-center gap-2">
                              <span>Required</span>
                              <Switch
                                checked={field.is_required ?? false}
                                onCheckedChange={(chk) => {
                                  setEditFields(editFields.map((f) => f._tempId === field._tempId ? { ...f, is_required: chk } : f));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Danger Zone</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={clearAllRecordsMutation.isPending}
                      className="text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/50"
                      onClick={() => {
                        if (confirm(`Wipe all stored data records in "${schema.name}"? The columns will stay.`)) {
                          clearAllRecordsMutation.mutate();
                        }
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear Stored Records
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deleteEntireSchemaMutation.isPending}
                      className="text-xs"
                      onClick={() => {
                        if (confirm(`PERMANENTLY DELETE "${schema.name}"? This deletes the section, all fields, and all its records forever.`)) {
                          deleteEntireSchemaMutation.mutate();
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Entire Section
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  className="w-full h-10"
                  disabled={!editName.trim() || alterSchemaMutation.isPending}
                  onClick={() => alterSchemaMutation.mutate()}
                >
                  {alterSchemaMutation.isPending ? "Saving Alterations..." : "Save Alterations"}
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
