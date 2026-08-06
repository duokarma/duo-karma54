import { useState, useCallback } from "react";
import { Plus, Settings, Trash2, GripVertical, Database, ChevronRight, Sparkles, X, Check } from "lucide-react";
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
import type { DynamicSchema, DynamicSchemaField, FieldType } from "@/types";
import { useNavigate } from "react-router-dom";

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
  // We render icons by mapping name → lucide component dynamically
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

// ── Field row inside the field editor ─────────────────────────────────────────
interface FieldRowProps {
  field: Partial<DynamicSchemaField> & { _tempId: string };
  index: number;
  onChange: (tempId: string, updates: Partial<DynamicSchemaField & { _tempId: string }>) => void;
  onRemove: (tempId: string) => void;
}

function FieldRow({ field, index, onChange, onRemove }: FieldRowProps) {
  const [selectOptions, setSelectOptions] = useState(
    field.options?.join(", ") ?? ""
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-edge bg-white/[0.03] p-3"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 shrink-0 text-ink-faint/40" />
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-ink-faint">
          {index + 1}
        </span>
        <div className="flex flex-1 flex-col gap-2 min-w-0 sm:flex-row sm:items-center">
          <Input
            placeholder="Field name (e.g. Phone Number)"
            value={field.name ?? ""}
            onChange={(e) =>
              onChange(field._tempId, {
                name: e.target.value,
                slug: slugify(e.target.value),
              })
            }
            className="flex-1 text-sm"
          />
          <Select
            value={field.type ?? "text"}
            onValueChange={(val) => onChange(field._tempId, { type: val as FieldType })}
          >
            <SelectTrigger className="sm:w-44">
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
        </div>
        <button
          type="button"
          onClick={() => onRemove(field._tempId)}
          className="ml-1 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-rose/10 hover:text-rose"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Select options input */}
      {field.type === "select" && (
        <div className="pl-9">
          <label className="mb-1 block text-[10px] font-medium text-ink-faint uppercase tracking-wide">
            Dropdown options — comma separated
          </label>
          <Input
            placeholder='e.g. "Option A, Option B, Option C"'
            value={selectOptions}
            onChange={(e) => {
              setSelectOptions(e.target.value);
              const opts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              onChange(field._tempId, { options: opts });
            }}
            className="text-xs"
          />
        </div>
      )}

      {/* Required toggle */}
      <div className="flex items-center justify-between pl-9">
        <span className="text-xs text-ink-faint">Required field</span>
        <Switch
          checked={field.is_required ?? false}
          onCheckedChange={(checked) => onChange(field._tempId, { is_required: checked })}
        />
      </div>
    </motion.div>
  );
}

// ── Schema Card on the main listing ───────────────────────────────────────────
function SchemaCard({ schema, onManage, onDelete }: {
  schema: DynamicSchema & { fieldCount?: number };
  onManage: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col gap-4 rounded-[var(--radius-card)] border border-edge bg-graphite/40 p-4 sm:p-5 overflow-hidden cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-colors"
      onClick={onManage}
    >
      {/* Glow */}
      <div className="absolute -inset-px rounded-[var(--radius-card)] bg-gradient-to-br from-electric/10 via-transparent to-indigo/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-edge text-xl">
            {renderIconComponent(schema.icon)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display font-semibold text-ink">{schema.name}</p>
            {schema.description && (
              <p className="truncate text-xs text-ink-faint mt-0.5">{schema.description}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 rounded-md p-1.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-all hover:bg-rose/10 hover:text-rose"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-faint">
          {schema.fieldCount ?? 0} {schema.fieldCount === 1 ? "field" : "fields"}
        </span>
        <div className="flex items-center gap-1 text-xs text-electric">
          <Settings className="h-3 w-3" />
          <span>Manage</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function SchemaBuilderPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Drawer states
  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<DynamicSchema | null>(null);

  // New schema form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("Database");
  const [newFields, setNewFields] = useState<Array<Partial<DynamicSchemaField> & { _tempId: string }>>([]);

  // Manage-fields state
  const [editFields, setEditFields] = useState<Array<Partial<DynamicSchemaField> & { _tempId: string }>>([]);

  // ── Queries ──
  const { data: schemas = [], isLoading } = useQuery({
    queryKey: ["dynamic_schemas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_schemas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DynamicSchema[];
    },
  });

  const { data: allFields = [] } = useQuery({
    queryKey: ["dynamic_schema_fields_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_schema_fields")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DynamicSchemaField[];
    },
  });

  const { data: manageFields = [] } = useQuery({
    queryKey: ["dynamic_schema_fields", selectedSchema?.id],
    queryFn: async () => {
      if (!selectedSchema) return [];
      const { data, error } = await supabase
        .from("dynamic_schema_fields")
        .select("*")
        .eq("schema_id", selectedSchema.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as DynamicSchemaField[];
    },
    enabled: !!selectedSchema,
  });


  // Sync manageFields into local editFields when drawer opens
  const openManage = useCallback((schema: DynamicSchema) => {
    setSelectedSchema(schema);
    setEditFields(
      (manageFields.length
        ? manageFields
        : allFields.filter((f) => f.schema_id === schema.id)
      ).map((f) => ({ ...f, _tempId: f.id }))
    );
    setManageOpen(true);
  }, [manageFields, allFields]);

  // ── Mutations ──
  const createSchemaMutation = useMutation({
    mutationFn: async () => {
      const slug = slugify(newName);
      const { data: schema, error: schemaError } = await supabase
        .from("dynamic_schemas")
        .insert([{ name: newName, slug, icon: newIcon, description: newDesc }])
        .select()
        .single();
      if (schemaError) throw schemaError;

      if (newFields.length > 0) {
        const fieldsToInsert = newFields
          .filter((f) => f.name && f.type)
          .map((f, i) => ({
            schema_id: schema.id,
            name: f.name!,
            slug: f.slug || slugify(f.name!),
            type: f.type!,
            is_required: f.is_required ?? false,
            options: f.options ?? null,
            sort_order: i,
          }));
        const { error: fieldsError } = await supabase
          .from("dynamic_schema_fields")
          .insert(fieldsToInsert);
        if (fieldsError) throw fieldsError;
      }
      return schema;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schemas"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields_all"] });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewIcon("Database");
      setNewFields([]);
      toast({ title: "Section created!", description: "It now appears in your sidebar.", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const deleteSchemaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dynamic_schemas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schemas"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields_all"] });
      toast({ title: "Section deleted", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const saveFieldsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSchema) return;
      // Delete all existing fields then re-insert
      await supabase.from("dynamic_schema_fields").delete().eq("schema_id", selectedSchema.id);
      const toInsert = editFields
        .filter((f) => f.name && f.type)
        .map((f, i) => ({
          schema_id: selectedSchema.id,
          name: f.name!,
          slug: f.slug || slugify(f.name!),
          type: f.type!,
          is_required: f.is_required ?? false,
          options: f.options ?? null,
          sort_order: i,
        }));
      if (toInsert.length > 0) {
        const { error } = await supabase.from("dynamic_schema_fields").insert(toInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields", selectedSchema?.id] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields_all"] });
      setManageOpen(false);
      toast({ title: "Fields saved!", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  // ── Field helpers ──
  const addField = (arr: typeof newFields, set: typeof setNewFields) => {
    set([...arr, { _tempId: crypto.randomUUID(), name: "", type: "text", is_required: false }]);
  };

  const updateField = (
    arr: typeof newFields,
    set: typeof setNewFields,
    tempId: string,
    updates: Partial<DynamicSchemaField & { _tempId: string }>
  ) => {
    set(arr.map((f) => (f._tempId === tempId ? { ...f, ...updates } : f)));
  };

  const removeField = (arr: typeof newFields, set: typeof setNewFields, tempId: string) => {
    set(arr.filter((f) => f._tempId !== tempId));
  };

  // Field counts per schema
  const fieldCounts = allFields.reduce<Record<string, number>>((acc, f) => {
    acc[f.schema_id] = (acc[f.schema_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Schema Builder"
        description="Create custom sections to store any kind of data you need"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Sparkles className="h-4 w-4" />
            New Section
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[var(--radius-card)] bg-white/[0.04]" />
          ))}
        </div>
      ) : schemas.length === 0 ? (
        <Card>
          <EmptyState
            icon={Database}
            title="No custom sections yet"
            description="Create your first section to start storing data your way. It will appear in the sidebar automatically."
            actionLabel="Create a section"
            onAction={() => setCreateOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {schemas.map((schema) => (
              <SchemaCard
                key={schema.id}
                schema={{ ...schema, fieldCount: fieldCounts[schema.id] ?? 0 }}
                onManage={() => openManage(schema)}
                onDelete={() => {
                  if (confirm(`Delete "${schema.name}"? All its records will also be deleted.`)) {
                    deleteSchemaMutation.mutate(schema.id);
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add schema card tile */}
      {schemas.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setCreateOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-edge py-8 text-sm text-ink-faint transition-colors hover:border-white/20 hover:text-ink-dim hover:bg-white/[0.02]"
        >
          <Plus className="h-4 w-4" />
          Add another section
        </motion.button>
      )}

      {/* ── Create New Schema Drawer ── */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Section</DrawerTitle>
            <DrawerDescription>
              Give it a name, pick an icon, and add the fields you need.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Section Name *</label>
              <Input
                placeholder="e.g. Clients, Inventory, Suppliers..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Description (optional)</label>
              <Input
                placeholder="What is this section for?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            {/* Icon picker */}
            <div>
              <label className="mb-2 block text-xs font-medium text-ink-dim">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(icon)}
                    title={icon}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all",
                      newIcon === icon
                        ? "border-electric bg-electric/20 shadow-[0_0_8px_rgba(96,165,250,0.4)]"
                        : "border-edge bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
                    )}
                  >
                    {renderIconComponent(icon, "h-4 w-4")}
                    {newIcon === icon && (
                      <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-electric">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-ink-dim">Fields</label>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => addField(newFields, setNewFields)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Field
                </Button>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {newFields.map((field, i) => (
                    <FieldRow
                      key={field._tempId}
                      field={field}
                      index={i}
                      onChange={(id, updates) => updateField(newFields, setNewFields, id, updates)}
                      onRemove={(id) => removeField(newFields, setNewFields, id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
              {newFields.length === 0 && (
                <p className="rounded-lg border border-dashed border-edge py-6 text-center text-xs text-ink-faint">
                  No fields yet. Click "Add Field" to define your columns.
                </p>
              )}
            </div>

            <Button
              className="w-full"
              disabled={!newName.trim() || createSchemaMutation.isPending}
              onClick={() => createSchemaMutation.mutate()}
            >
              {createSchemaMutation.isPending ? "Creating..." : "Create Section"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Manage Fields Drawer ── */}
      <Drawer open={manageOpen} onOpenChange={setManageOpen}>
        <DrawerContent>
          {selectedSchema && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.08] border border-edge text-xl">
                    {renderIconComponent(selectedSchema.icon)}
                  </div>
                  <div>
                    <DrawerTitle>Manage "{selectedSchema.name}" Fields</DrawerTitle>
                    <DrawerDescription>Add, remove, or reorder the fields for this section.</DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-faint">{editFields.length} fields configured</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => addField(editFields, setEditFields)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Field
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {editFields.map((field, i) => (
                      <FieldRow
                        key={field._tempId}
                        field={field}
                        index={i}
                        onChange={(id, updates) => updateField(editFields, setEditFields, id, updates)}
                        onRemove={(id) => removeField(editFields, setEditFields, id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {editFields.length === 0 && (
                  <p className="rounded-lg border border-dashed border-edge py-6 text-center text-xs text-ink-faint">
                    No fields yet.
                  </p>
                )}

                <Button
                  className="w-full"
                  disabled={saveFieldsMutation.isPending}
                  onClick={() => saveFieldsMutation.mutate()}
                >
                  {saveFieldsMutation.isPending ? "Saving..." : "Save Fields"}
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
