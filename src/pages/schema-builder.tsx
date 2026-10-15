import { useState, useCallback } from "react";
import {
  Plus,
  Settings,
  Trash2,
  Database,
  Sparkles,
  X,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
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
import { logActivity } from "@/lib/activity-logger";
import { Link } from "react-router-dom";
import type { DynamicSchema, DynamicSchemaField, FieldType } from "@/types";

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

// ── Field row inside the field editor with Full Alteration Power ─────────────
interface FieldRowProps {
  field: Partial<DynamicSchemaField> & { _tempId: string };
  index: number;
  totalFields: number;
  onChange: (tempId: string, updates: Partial<DynamicSchemaField & { _tempId: string }>) => void;
  onRemove: (tempId: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

function FieldRow({ field, index, totalFields, onChange, onRemove, onMoveUp, onMoveDown }: FieldRowProps) {
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
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-edge bg-white/[0.03] p-3 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2">
        {/* Reordering Controls */}
        <div className="flex flex-col shrink-0 gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp?.(index)}
            className="p-1 rounded text-ink-faint hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
            title="Move field up"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={index === totalFields - 1}
            onClick={() => onMoveDown?.(index)}
            className="p-1 rounded text-ink-faint hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
            title="Move field down"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

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
          className="ml-1 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-rose-500/15 hover:text-rose-400"
          title="Delete field"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Select options input */}
      {field.type === "select" && (
        <div className="pl-9 space-y-1">
          <label className="block text-[10px] font-medium text-ink-faint uppercase tracking-wide">
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

      {/* Field Slug and Required toggle */}
      <div className="flex items-center justify-between pl-9 pt-1 border-t border-white/5 text-xs text-ink-faint">
        <span className="font-mono text-[10px]">Slug: {field.slug || slugify(field.name || "")}</span>
        <div className="flex items-center gap-2">
          <span>Required field</span>
          <Switch
            checked={field.is_required ?? false}
            onCheckedChange={(checked) => onChange(field._tempId, { is_required: checked })}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Schema Card on the main listing with Explicit Alteration & Delete Controls ─
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
      className="group relative flex flex-col justify-between rounded-[var(--radius-card)] border border-edge bg-graphite/40 p-4 sm:p-5 overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.04]"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-edge text-2xl shadow-sm">
              {renderIconComponent(schema.icon)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display font-semibold text-base text-ink">{schema.name}</p>
              <p className="truncate text-xs text-ink-faint mt-0.5">
                {schema.description || `/${schema.slug}`}
              </p>
            </div>
          </div>

          {/* Delete Button: Permanently accessible on mobile & desktop */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/15 active:bg-rose-500/25 transition-all touch-manipulation cursor-pointer shrink-0"
            title={`Delete ${schema.name}`}
            aria-label={`Delete ${schema.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-ink-dim">
            {schema.fieldCount ?? 0} {schema.fieldCount === 1 ? "field" : "fields"}
          </span>
          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400">
            Live in Sidebar
          </span>
        </div>
      </div>

      {/* Action Buttons: Full Alteration Power */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <Link
          to={`/admin/custom/${schema.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold py-2 transition-all"
        >
          <Database className="h-3.5 w-3.5" />
          <span>View Records</span>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={onManage}
          className="flex-1 text-xs border-white/10 hover:bg-white/5 text-ink-dim hover:text-white"
        >
          <Settings className="h-3.5 w-3.5 mr-1" />
          <span>Alter Schema</span>
        </Button>
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
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Manage-fields state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("Database");
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

  // Sync manageFields into local editFields when drawer opens
  const openManage = useCallback((schema: DynamicSchema) => {
    setSelectedSchema(schema);
    setEditName(schema.name);
    setEditDesc(schema.description || "");
    setEditIcon(schema.icon || "Database");
    
    // Always pull fresh fields matching this schema
    const fieldsForSchema = allFields
      .filter((f) => f.schema_id === schema.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    setEditFields(
      fieldsForSchema.map((f) => ({ ...f, _tempId: f.id }))
    );
    setManageOpen(true);
  }, [allFields]);

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
          
        if (fieldsToInsert.length > 0) {
          const { error: fieldsError } = await supabase
            .from("dynamic_schema_fields")
            .insert(fieldsToInsert);
            
          if (fieldsError) {
            await supabase.from("dynamic_schemas").delete().eq("id", schema.id);
            throw new Error(`Failed to save fields: ${fieldsError.message}`);
          }
        }
      }

      logActivity({
        type: "project",
        message: `Custom section "${newName}" created in Schema Builder`,
      });

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
      const schemaToDelete = schemas.find((s) => s.id === id);
      const { error } = await supabase.from("dynamic_schemas").delete().eq("id", id);
      if (error) throw error;

      logActivity({
        type: "project",
        message: `Custom section "${schemaToDelete?.name || "Schema"}" deleted`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schemas"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields_all"] });
      toast({ title: "Section deleted", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const clearRecordsMutation = useMutation({
    mutationFn: async (schemaId: string) => {
      const { error } = await supabase.from("dynamic_records").delete().eq("schema_id", schemaId);
      if (error) throw error;

      logActivity({
        type: "project",
        message: `Cleared all records in section "${selectedSchema?.name || "Schema"}"`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_records"] });
      toast({ title: "All records cleared", description: "Records deleted, schema definition preserved.", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const saveFieldsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSchema) return;
      
      // Update schema details
      const { error: schemaUpdateError } = await supabase
        .from("dynamic_schemas")
        .update({
          name: editName,
          description: editDesc,
          icon: editIcon,
        })
        .eq("id", selectedSchema.id);
      if (schemaUpdateError) throw schemaUpdateError;

      // Delete all existing fields then re-insert with sort_order
      await supabase.from("dynamic_schema_fields").delete().eq("schema_id", selectedSchema.id);
      const toInsert = editFields
        .filter((f) => f.name && f.type)
        .map((f, i) => {
          const field: any = {
            schema_id: selectedSchema.id,
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
        const { error } = await supabase.from("dynamic_schema_fields").insert(toInsert);
        if (error) throw error;
      }

      logActivity({
        type: "project",
        message: `Altered fields & configuration for section "${editName}"`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dynamic_schemas"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields", selectedSchema?.id] });
      queryClient.invalidateQueries({ queryKey: ["dynamic_schema_fields_all"] });
      setManageOpen(false);
      toast({ title: "Schema altered successfully!", variant: "success" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const generateFields = async () => {
    if (!newName.trim()) {
      toast({ title: "Missing Name", description: "Please enter a section name first.", variant: "error" });
      return;
    }
    
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schema",
          prompt: `Generate a list of EXACTLY 4 to 6 of the most critical and useful database fields for a schema named: "${newName}". The user also provided this description for context: "${newDesc || "None"}". DO NOT add unnecessary or bloat fields. Only include the absolutely essential fields that are most important for this use-case.`,
          systemPrompt: `You are an expert database architect. Return ONLY valid JSON in this exact structure: { "fields": [ { "name": "Field Name", "type": "text|number|boolean|date|email|url|select|textarea", "options": ["opt1", "opt2"] /* only if type is select */ } ] }`
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch");
      
      const content = JSON.parse(data.choices[0].message.content);
      if (content.fields && Array.isArray(content.fields)) {
        const aiFields = content.fields.map((f: any) => ({
          _tempId: crypto.randomUUID(),
          name: f.name || "Field",
          type: f.type || "text",
          is_required: false,
          options: f.options || [],
        }));
        setNewFields(aiFields);
        toast({ title: "Fields generated!", description: `AI generated ${aiFields.length} fields.`, variant: "success" });
      } else {
        throw new Error("Unexpected JSON structure");
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "AI Error", description: "Failed to generate fields.", variant: "error" });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // ── Field manipulation helpers ──
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

  const moveField = (arr: typeof newFields, set: typeof setNewFields, fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= arr.length) return;
    const copy = [...arr];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    set(copy);
  };

  // Field counts per schema
  const fieldCounts = allFields.reduce<Record<string, number>>((acc, f) => {
    acc[f.schema_id] = (acc[f.schema_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Schema Builder"
        description="Create, alter, and manage custom database sections with maximum alteration power"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            New Section
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-[var(--radius-card)] bg-white/[0.04]" />
          ))}
        </div>
      ) : schemas.length === 0 ? (
        <Card>
          <EmptyState
            icon={Database}
            title="No custom sections yet"
            description="Create your first section to start storing data your way. It will appear in the sidebar automatically and can be altered anytime."
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
                  if (confirm(`PERMANENTLY DELETE "${schema.name}"? This deletes the schema, all fields, and all its stored records forever.`)) {
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
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-edge py-7 text-sm text-ink-faint transition-colors hover:border-white/20 hover:text-ink-dim hover:bg-white/[0.02] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add another custom section
        </motion.button>
      )}

      {/* ── Create New Schema Drawer ── */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Create New Section</DrawerTitle>
            <DrawerDescription>
              Give it a name, pick an icon, and add initial fields. You can alter anything later.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 overflow-y-auto max-h-[70vh] px-1 custom-scrollbar">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Section Name *</label>
              <Input
                placeholder="e.g. Products, Notes, Inventory, Partners..."
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
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all relative",
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
                <label className="text-xs font-medium text-ink-dim">Fields ({newFields.length})</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={generateFields}
                    disabled={isGeneratingAi}
                    className="border-electric/30 text-electric hover:bg-electric/10 hover:border-electric/50 text-xs h-7"
                  >
                    {isGeneratingAi ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    AI Generate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => addField(newFields, setNewFields)}
                    className="text-xs h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Field
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {newFields.map((field, i) => (
                    <FieldRow
                      key={field._tempId}
                      field={field}
                      index={i}
                      totalFields={newFields.length}
                      onChange={(id, updates) => updateField(newFields, setNewFields, id, updates)}
                      onRemove={(id) => removeField(newFields, setNewFields, id)}
                      onMoveUp={(idx) => moveField(newFields, setNewFields, idx, idx - 1)}
                      onMoveDown={(idx) => moveField(newFields, setNewFields, idx, idx + 1)}
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

      {/* ── Manage / Alter Fields Drawer (Full Alteration Power) ── */}
      <Drawer open={manageOpen} onOpenChange={setManageOpen}>
        <DrawerContent className="max-h-[92vh]">
          {selectedSchema && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-edge text-2xl shadow-sm shrink-0">
                    {renderIconComponent(editIcon)}
                  </div>
                  <div>
                    <DrawerTitle>Alter "{selectedSchema.name}"</DrawerTitle>
                    <DrawerDescription>
                      Full alteration control: rename, change icon, reorder, add or delete fields anytime.
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
                      placeholder="e.g. Clients, Inventory, Suppliers..."
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ink-dim">Description (optional)</label>
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
                      <p className="text-[11px] text-ink-faint">{editFields.length} fields configured</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => addField(editFields, setEditFields)}
                      className="text-xs h-8 gap-1"
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
                          totalFields={editFields.length}
                          onChange={(id, updates) => updateField(editFields, setEditFields, id, updates)}
                          onRemove={(id) => removeField(editFields, setEditFields, id)}
                          onMoveUp={(idx) => moveField(editFields, setEditFields, idx, idx - 1)}
                          onMoveDown={(idx) => moveField(editFields, setEditFields, idx, idx + 1)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {editFields.length === 0 && (
                    <p className="rounded-lg border border-dashed border-edge py-6 text-center text-xs text-ink-faint">
                      No fields configured. Click "Add Field" to define structure.
                    </p>
                  )}
                </div>

                {/* Danger Zone: Maximum Deletion & Control Power */}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Danger Zone & Data Controls</span>
                  </div>
                  <p className="text-[11px] text-ink-faint">
                    Wipe stored rows or erase this section completely from the workspace.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={clearRecordsMutation.isPending}
                      className="text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/50"
                      onClick={() => {
                        if (confirm(`Clear all stored data entries in "${selectedSchema.name}"? The fields structure will be kept, but all data rows will be deleted.`)) {
                          clearRecordsMutation.mutate(selectedSchema.id);
                        }
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-1.5" />
                      {clearRecordsMutation.isPending ? "Clearing..." : "Clear Stored Records"}
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deleteSchemaMutation.isPending}
                      className="text-xs"
                      onClick={() => {
                        if (confirm(`PERMANENTLY DELETE "${selectedSchema.name}"? This deletes the schema, all its fields, and all its stored records forever.`)) {
                          deleteSchemaMutation.mutate(selectedSchema.id);
                          setManageOpen(false);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      {deleteSchemaMutation.isPending ? "Deleting..." : "Delete Entire Section"}
                    </Button>
                  </div>
                </div>

                {/* Save Changes Button */}
                <Button
                  className="w-full h-10"
                  disabled={!editName.trim() || saveFieldsMutation.isPending}
                  onClick={() => saveFieldsMutation.mutate()}
                >
                  {saveFieldsMutation.isPending ? "Saving Alterations..." : "Save Alterations"}
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
