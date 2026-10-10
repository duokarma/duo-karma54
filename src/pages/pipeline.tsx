import { useState, useMemo, useCallback, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  Plus, Target, Users, Phone, Mail, IndianRupee, CheckCircle2,
  MoreVertical, Pencil, Trash2, ArrowRight, Upload,
  FileText, ImageIcon, X, ExternalLink, Loader2, Search,
  Percent, ReceiptText, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/shared/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Lead, Client } from "@/types";
import { uploadToStorage } from "@/lib/storage";

// ── Stage config ─────────────────────────────────────────────────────────────
const LEAD_STAGES = [
  { key: "new",         label: "New",         color: "#6366F1", bg: "#6366F115" },
  { key: "negotiation", label: "Negotiation", color: "#F59E0B", bg: "#F59E0B15" },
  { key: "won",         label: "Won",         color: "#10B981", bg: "#10B98115" },
  { key: "lost",        label: "Lost",        color: "#EF4444", bg: "#EF444415" },
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number]["key"];

export function normalizeLeadStage(rawStage?: string): LeadStage {
  if (!rawStage) return "new";
  const s = rawStage.toLowerCase().trim();
  if (s === "new" || s === "contacted" || s === "qualified" || s === "lead" || s === "inquiry" || s === "discovery") return "new";
  if (s === "negotiation" || s === "proposal" || s === "in_progress" || s === "in-progress" || s === "discussion" || s === "meeting") return "negotiation";
  if (s === "won" || s === "converted" || s === "closed_won" || s === "closed" || s === "client") return "won";
  if (s === "lost" || s === "rejected" || s === "cancelled" || s === "closed_lost" || s === "archive") return "lost";
  return "new";
}

const CLIENT_STATUSES = [
  { key: "active",           label: "Active" },
  { key: "inactive",         label: "Inactive" },
  { key: "pending_payment",  label: "Pending Payment" },
  { key: "completed",        label: "Completed" },
] as const;

// ── Tiny helpers ─────────────────────────────────────────────────────────────
function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <ImageIcon className="h-3.5 w-3.5 text-blue-400" />;
  return <FileText className="h-3.5 w-3.5 text-violet-400" />;
}

// ── File Attachment Panel ─────────────────────────────────────────────────────
function FilePanel({
  entityId,
  entityType,
}: {
  entityId: string;
  entityType: "lead" | "client";
}) {
  const { displayName } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const table = entityType === "lead" ? "lead_files" : "client_files";
  const column = entityType === "lead" ? "lead_id" : "client_id";

  const { data: files = [] } = useQuery({
    queryKey: [table, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(column, entityId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string; file_name: string; file_url: string;
        file_type: string; file_size: string; uploaded_by: string; uploaded_at: string;
      }>;
    },
    enabled: !!entityId,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    try {
      for (const file of selected) {
        const uploaded = await uploadToStorage(file, {
          folder: entityType === 'lead' ? 'leads' : 'clients',
          entityId,
        });
        await supabase.from(table).insert({
          [column]:      entityId,
          file_name:     uploaded.fileName,
          file_url:      uploaded.publicUrl,
          file_type:     uploaded.fileType,
          file_size:     uploaded.fileSize,
          uploaded_by:   displayName,
        });
      }
      qc.invalidateQueries({ queryKey: [table, entityId] });
      toast({ title: `${selected.length} file(s) uploaded` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId: string) => {
    await supabase.from(table).delete().eq("id", fileId);
    qc.invalidateQueries({ queryKey: [table, entityId] });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Files & Documents</p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[11px] gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileChange}
        />
      </div>

      {files.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-8 cursor-pointer hover:border-white/20 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-ink/30 mb-2" />
          <p className="text-xs text-ink/40">Drop files here or click to upload</p>
          <p className="text-[10px] text-ink/25 mt-0.5">Images, PDFs, documents</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/3 px-3 py-2"
            >
              {fileIcon(f.file_name)}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{f.file_name}</p>
                <p className="text-[10px] text-ink/40">{f.file_size} · {f.uploaded_by}</p>
              </div>
              <a
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/30 hover:text-ink/70 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => handleDelete(f.id)}
                className="text-ink/20 hover:text-red-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Lead Detail Drawer ────────────────────────────────────────────────────────
function LeadDrawer({
  lead,
  open,
  onClose,
  onEdit,
  onConvert,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onConvert: (lead: Lead) => void;
}) {
  if (!lead) return null;
  const stageKey = normalizeLeadStage(lead.stage);
  const stage = LEAD_STAGES.find((s) => s.key === stageKey);
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader>
          <DrawerTitle className="text-base">{lead.company || lead.name}</DrawerTitle>
          <DrawerDescription>{lead.name} · {lead.source}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          {/* Stage badge */}
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: stage?.bg, color: stage?.color, border: `1px solid ${stage?.color}40` }}
            >
              {stage?.label?.toUpperCase() ?? "NEW"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Info label="Deal Value" value={formatCurrency(lead.value ?? 0)} />
            <Info label="Probability" value={`${lead.probability ?? 0}%`} />
            <Info label="Assigned To" value={lead.assignedTo ?? "—"} />
            <Info label="Service" value={lead.interestedIn ?? lead.businessType ?? "—"} />
            {lead.phone && (
              <Info
                label="Phone"
                value={
                  <a href={`tel:${lead.phone}`} className="text-blue-400 hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {lead.phone}
                  </a>
                }
              />
            )}
            {lead.email && (
              <Info
                label="Email"
                value={
                  <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {lead.email}
                  </a>
                }
              />
            )}
            {lead.notes && <Info label="Notes" value={lead.notes} className="col-span-2" />}
          </div>

          {/* Commission info */}
          {(lead as any).commission_applicable && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2">
              <Percent className="h-3.5 w-3.5 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-amber-300">Commission Applicable</p>
                <p className="text-[11px] text-amber-400/70">
                  {formatCurrency((lead as any).commission_amount ?? 0)} to {(lead as any).commission_to ?? "—"}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Lead
            </Button>
            {lead.stage !== "won" && lead.stage !== "lost" && (
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => onConvert(lead)}>
                <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Convert to Client
              </Button>
            )}
          </div>

          <FilePanel entityId={lead.id} entityType="lead" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ── Client Detail Drawer ──────────────────────────────────────────────────────
function ClientDrawer({
  client,
  open,
  onClose,
  onEdit,
}: {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  if (!client) return null;

  const totalValue   = client.totalValue ?? 0;
  const advancePaid  = (client as any).advance_paid ?? 0;
  const remaining    = (client as any).remaining_amount ?? (totalValue - advancePaid);
  const gstAmount    = (client as any).gst_amount ?? 0;
  const commission   = (client as any).commission_amount ?? 0;
  const commissionTo = (client as any).commission_to ?? "";

  const pct = totalValue > 0 ? Math.round((advancePaid / totalValue) * 100) : 0;

  const markAdvance = async () => {
    await supabase.from("clients").update({ advance_paid: totalValue, remaining_amount: 0 }).eq("id", client.id);
    qc.invalidateQueries({ queryKey: ["clients"] });
    toast({ title: "Advance marked as fully received" });
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader>
          <DrawerTitle className="text-base">{client.name}</DrawerTitle>
          <DrawerDescription>{client.company} · {client.location}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          <StatusBadge status={client.status} />

          {/* Payment progress bar */}
          <div className="mt-4 mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-ink">Payment Progress</p>
              <p className="text-xs text-ink/60">{pct}% received</p>
            </div>
            <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-ink/50">Advance: {formatCurrency(advancePaid)}</span>
              <span className="text-[11px] text-ink/50">
                {remaining > 0 ? `Due: ${formatCurrency(remaining)}` : "Fully paid ✓"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Info label="Total Value" value={formatCurrency(totalValue)} />
            <Info label="Income Type" value={client.incomeType ?? "one-time"} />
            {client.phone && (
              <Info label="Phone" value={
                <a href={`tel:${client.phone}`} className="text-blue-400 hover:underline flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {client.phone}
                </a>
              } />
            )}
            {client.email && (
              <Info label="Email" value={
                <a href={`mailto:${client.email}`} className="text-blue-400 hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {client.email}
                </a>
              } />
            )}
          </div>

          {/* GST info */}
          {(client as any).gst_applicable && gstAmount > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/8 px-3 py-2">
              <ReceiptText className="h-3.5 w-3.5 text-blue-400" />
              <div>
                <p className="text-xs font-medium text-blue-300">GST Project</p>
                <p className="text-[11px] text-blue-400/70">GST Amount: {formatCurrency(gstAmount)}</p>
              </div>
            </div>
          )}

          {/* Commission info */}
          {(client as any).commission_applicable && commission > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2">
              <Percent className="h-3.5 w-3.5 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-amber-300">
                  Commission: {formatCurrency(commission)} to {commissionTo}
                </p>
                <p className="text-[11px] text-amber-400/70">
                  Status: {(client as any).commission_paid ? "✓ Paid" : "Pending"}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
            {remaining > 0 && (
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={markAdvance}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark Fully Paid
              </Button>
            )}
          </div>

          <FilePanel entityId={client.id} entityType="client" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ── Info helper ───────────────────────────────────────────────────────────────
function Info({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-0.5">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}

// ── Lead Form ─────────────────────────────────────────────────────────────────
function LeadForm({
  initial,
  onSave,
  onClose,
  isSaving,
}: {
  initial?: Partial<Lead & { commission_applicable?: boolean; commission_amount?: number; commission_to?: string; advance_paid?: number; remaining_amount?: number }>;
  onSave: (data: any) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const { displayName } = useAuth();
  const [form, setForm] = useState({
    name:                    initial?.name ?? "",
    company:                 initial?.company ?? "",
    phone:                   initial?.phone ?? "",
    email:                   initial?.email ?? "",
    value:                   initial?.value ?? 0,
    stage:                   normalizeLeadStage(initial?.stage),
    probability:             initial?.probability ?? 50,
    source:                  initial?.source ?? "Referral",
    interestedIn:            initial?.interestedIn ?? "",
    advance_paid:            (initial as any)?.advance_paid ?? 0,
    remaining_amount:        (initial as any)?.remaining_amount ?? (initial?.value ?? 0),
    notes:                   initial?.notes ?? "",
    commission_applicable:   initial?.commission_applicable ?? false,
    commission_amount:       initial?.commission_amount ?? 0,
    commission_to:           initial?.commission_to ?? "",
    assignedTo:              initial?.assignedTo ?? displayName,
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 px-4 pb-8">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Contact Name</label>
          <Input placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Business / Company</label>
          <Input placeholder="Company name" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Phone</label>
          <Input placeholder="+91 98765..." value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Email</label>
          <Input placeholder="email@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Deal Value (₹)</label>
          <Input
            type="number"
            placeholder="0"
            value={form.value}
            onChange={(e) => {
              const val = +e.target.value;
              set("value", val);
              set("remaining_amount", Math.max(0, val - (form.advance_paid || 0)));
            }}
          />
        </div>
        <div>
          <label className="field-label">Advance Paid (₹)</label>
          <Input
            type="number"
            placeholder="0"
            value={form.advance_paid}
            onChange={(e) => {
              const adv = +e.target.value;
              set("advance_paid", adv);
              set("remaining_amount", Math.max(0, (form.value || 0) - adv));
            }}
          />
        </div>
        <div>
          <label className="field-label">Remaining Due (₹)</label>
          <Input
            type="number"
            placeholder="0"
            value={form.remaining_amount}
            onChange={(e) => set("remaining_amount", +e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Probability (%)</label>
          <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => set("probability", +e.target.value)} />
        </div>
        <div>
          <label className="field-label">Stage</label>
          <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="field-label">Source</label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Referral", "Website", "Instagram", "WhatsApp", "Cold Call", "Other"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Interested In (Service)</label>
          <Input placeholder="e.g. Website, App, Branding..." value={form.interestedIn} onChange={(e) => set("interestedIn", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Assigned Partner</label>
          <Select value={form.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
            <SelectTrigger><SelectValue placeholder="Assign partner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Hatim">Hatim (Co-founder)</SelectItem>
              <SelectItem value="Moiz">Moiz (Co-founder)</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="field-label">Notes</label>
        <textarea
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          rows={3}
          placeholder="Any details about this lead..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      {/* Commission toggle */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs font-medium text-ink">Commission Applicable?</p>
          </div>
          <button
            type="button"
            onClick={() => set("commission_applicable", !form.commission_applicable)}
            className={`relative h-5 w-9 rounded-full transition-colors ${form.commission_applicable ? "bg-amber-500" : "bg-white/10"}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.commission_applicable ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
        </div>
        {form.commission_applicable && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Commission Amount (₹)</label>
              <Input type="number" placeholder="0" value={form.commission_amount} onChange={(e) => set("commission_amount", +e.target.value)} />
            </div>
            <div>
              <label className="field-label">Commission To (Name)</label>
              <Input placeholder="Who gets it?" value={form.commission_to} onChange={(e) => set("commission_to", e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button className="flex-1" onClick={() => onSave(form)} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Lead
        </Button>
      </div>
    </div>
  );
}

// ── Client Form ───────────────────────────────────────────────────────────────
function ClientForm({
  initial,
  onSave,
  onClose,
  isSaving,
}: {
  initial?: Partial<Client & Record<string, any>>;
  onSave: (data: any) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name:                  initial?.name ?? "",
    company:               initial?.company ?? "",
    phone:                 initial?.phone ?? "",
    email:                 initial?.email ?? "",
    location:              initial?.location ?? "",
    status:                initial?.status ?? "active",
    totalValue:            initial?.totalValue ?? 0,
    advance_paid:          initial?.advance_paid ?? 0,
    remaining_amount:      initial?.remaining_amount ?? 0,
    incomeType:            initial?.incomeType ?? "one-time",
    gst_applicable:        initial?.gst_applicable ?? false,
    gst_amount:            initial?.gst_amount ?? 0,
    commission_applicable: initial?.commission_applicable ?? false,
    commission_amount:     initial?.commission_amount ?? 0,
    commission_to:         initial?.commission_to ?? "",
    commission_paid:       initial?.commission_paid ?? false,
    notes:                 initial?.notes ?? "",
    assignedTo:            initial?.assignedTo ?? (initial as any)?.assigned_to ?? "Hatim",
    assigned_to:           (initial as any)?.assigned_to ?? initial?.assignedTo ?? "Hatim",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-calc remaining when totalValue or advance_paid changes
  const remaining = Math.max(0, (form.totalValue || 0) - (form.advance_paid || 0));

  return (
    <div className="space-y-4 px-4 pb-8">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Client Name</label>
          <Input placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Business / Company</label>
          <Input placeholder="Company name" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Phone</label>
          <Input placeholder="+91..." value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Email</label>
          <Input placeholder="email@..." value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Location</label>
          <Input placeholder="City" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CLIENT_STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <label className="field-label">Assigned Partner</label>
          <Select value={form.assignedTo} onValueChange={(v) => { set("assignedTo", v); set("assigned_to", v); }}>
            <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Hatim">Hatim (Co-founder)</SelectItem>
              <SelectItem value="Moiz">Moiz (Co-founder)</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment section */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
        <p className="text-xs font-semibold text-ink/60 uppercase tracking-widest flex items-center gap-1.5">
          <IndianRupee className="h-3.5 w-3.5" /> Payment Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Total Project Value (₹)</label>
            <Input type="number" placeholder="0" value={form.totalValue}
              onChange={(e) => { set("totalValue", +e.target.value); set("remaining_amount", Math.max(0, +e.target.value - form.advance_paid)); }} />
          </div>
          <div>
            <label className="field-label">Income Type</label>
            <Select value={form.incomeType} onValueChange={(v) => set("incomeType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="field-label">Advance Received (₹)</label>
            <Input type="number" placeholder="0" value={form.advance_paid}
              onChange={(e) => { set("advance_paid", +e.target.value); set("remaining_amount", Math.max(0, form.totalValue - +e.target.value)); }} />
          </div>
          <div>
            <label className="field-label">Remaining Due (₹)</label>
            <Input type="number" value={remaining} readOnly className="opacity-60 cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* GST */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-3.5 w-3.5 text-blue-400" />
            <p className="text-xs font-medium text-ink">GST Project?</p>
          </div>
          <button
            type="button"
            onClick={() => set("gst_applicable", !form.gst_applicable)}
            className={`relative h-5 w-9 rounded-full transition-colors ${form.gst_applicable ? "bg-blue-500" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.gst_applicable ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
        {form.gst_applicable && (
          <div className="mt-3">
            <label className="field-label">GST Amount (₹)</label>
            <Input type="number" placeholder="0" value={form.gst_amount} onChange={(e) => set("gst_amount", +e.target.value)} />
          </div>
        )}
      </div>

      {/* Commission */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs font-medium text-ink">Commission Applicable?</p>
          </div>
          <button
            type="button"
            onClick={() => set("commission_applicable", !form.commission_applicable)}
            className={`relative h-5 w-9 rounded-full transition-colors ${form.commission_applicable ? "bg-amber-500" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.commission_applicable ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
        {form.commission_applicable && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Commission Amount (₹)</label>
              <Input type="number" placeholder="0" value={form.commission_amount} onChange={(e) => set("commission_amount", +e.target.value)} />
            </div>
            <div>
              <label className="field-label">Commission To</label>
              <Input placeholder="Name" value={form.commission_to} onChange={(e) => set("commission_to", e.target.value)} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="comm_paid" checked={form.commission_paid} onChange={(e) => set("commission_paid", e.target.checked)} className="accent-amber-400" />
              <label htmlFor="comm_paid" className="text-xs text-ink/70">Commission already paid</label>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="field-label">Notes</label>
        <textarea
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          rows={2}
          placeholder="Any notes about this client..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button className="flex-1" onClick={() => onSave({ ...form, remaining_amount: remaining })} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Client
        </Button>
      </div>
    </div>
  );
}

// ── Main Pipeline Page ────────────────────────────────────────────────────────
export function PipelinePage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { displayName } = useAuth();

  const [activeTab, setActiveTab] = useState<"leads" | "clients">("leads");
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<"all" | "Hatim" | "Moiz">("all");

  // Leads
  const [selectedLead, setSelectedLead]     = useState<Lead | null>(null);
  const [leadDetailOpen, setLeadDetailOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen]     = useState(false);
  const [editingLead, setEditingLead]       = useState<Lead | null>(null);

  // Clients
  const [selectedClient, setSelectedClient]     = useState<Client | null>(null);
  const [clientDetailOpen, setClientDetailOpen] = useState(false);
  const [clientFormOpen, setClientFormOpen]     = useState(false);
  const [editingClient, setEditingClient]       = useState<Client | null>(null);
  const [statusFilter, setStatusFilter]         = useState("all");

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").order("createdDate", { ascending: false });
      return (data ?? []) as Lead[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").order("joinedDate", { ascending: false });
      return (data ?? []) as Client[];
    },
  });

  // ── Lead mutations ────────────────────────────────────────────────────────
  const saveLead = useMutation({
    mutationFn: async (data: any) => {
      if (editingLead) {
        const { error } = await supabase.from("leads").update(data).eq("id", editingLead.id);
        if (error) throw error;
      } else {
        const id = `lead_${Date.now()}`;
        const { error } = await supabase.from("leads").insert({
          ...data,
          id,
          createdDate: new Date().toISOString().slice(0, 10),
          lastContact: new Date().toISOString().slice(0, 10),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: editingLead ? "Lead updated" : "Lead added" });
      setLeadFormOpen(false);
      setEditingLead(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("leads").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead deleted" });
    },
  });

  const moveLeadStage = useCallback(async (lead: Lead, stage: LeadStage) => {
    await supabase.from("leads").update({ stage }).eq("id", lead.id);
    qc.invalidateQueries({ queryKey: ["leads"] });
  }, [qc]);

  const convertToClient = useCallback(async (lead: Lead) => {
    const id = `client_${Date.now()}`;
    await supabase.from("clients").insert({
      id,
      name:        lead.name ?? lead.company ?? "",
      company:     lead.company ?? "",
      email:       lead.email ?? "",
      phone:       lead.phone ?? "",
      avatarSeed:  lead.name ?? "client",
      status:      "active",
      totalValue:  lead.value ?? 0,
      projectsCount: 0,
      joinedDate:  new Date().toISOString().slice(0, 10),
      location:    "",
      tags:        [],
      advance_paid: 0,
      remaining_amount: lead.value ?? 0,
      assignedTo: lead.assignedTo ?? "Hatim",
      assigned_to: lead.assignedTo ?? "Hatim",
    });
    await supabase.from("leads").update({ stage: "won" }).eq("id", lead.id);
    qc.invalidateQueries({ queryKey: ["leads", "clients"] });
    toast({ title: `${lead.name ?? lead.company} converted to client!` });
    setLeadDetailOpen(false);
    setActiveTab("clients");
  }, [qc, toast]);

  // ── Client mutations ──────────────────────────────────────────────────────
  const saveClient = useMutation({
    mutationFn: async (data: any) => {
      if (editingClient) {
        const { error } = await supabase.from("clients").update(data).eq("id", editingClient.id);
        if (error) throw error;
      } else {
        const id = `client_${Date.now()}`;
        const { error } = await supabase.from("clients").insert({
          ...data,
          id,
          avatarSeed:   data.name,
          projectsCount: 0,
          joinedDate:   new Date().toISOString().slice(0, 10),
          tags:         [],
          amountPaid:   data.advance_paid ?? 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: editingClient ? "Client updated" : "Client added" });
      setClientFormOpen(false);
      setEditingClient(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("clients").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Client deleted" });
    },
  });

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchSearch = !q || l.company?.toLowerCase().includes(q) || l.name?.toLowerCase().includes(q);
      const assigned = (l.assignedTo || "").toLowerCase();
      const matchPartner =
        partnerFilter === "all" ||
        (partnerFilter === "Hatim" && assigned.includes("hatim")) ||
        (partnerFilter === "Moiz" && assigned.includes("moiz"));
      return matchSearch && matchPartner;
    });
  }, [leads, search, partnerFilter]);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const assigned = ((c as any).assignedTo || (c as any).assigned_to || "").toLowerCase();
      const matchPartner =
        partnerFilter === "all" ||
        (partnerFilter === "Hatim" && (assigned.includes("hatim") || !assigned)) ||
        (partnerFilter === "Moiz" && assigned.includes("moiz"));
      return matchSearch && matchStatus && matchPartner;
    });
  }, [clients, search, statusFilter, partnerFilter]);

  const leadsByStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const s of LEAD_STAGES) map[s.key] = [];
    for (const l of filteredLeads) {
      const stageKey = normalizeLeadStage(l.stage);
      if (map[stageKey]) {
        map[stageKey].push(l);
      } else {
        map["new"].push(l);
      }
    }
    return map;
  }, [filteredLeads]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalLeadValue = leads.reduce((s, l) => s + (l.value ?? 0), 0);
  const wonLeads       = leads.filter((l) => normalizeLeadStage(l.stage) === "won").length;
  const totalClients   = clients.length;
  const totalRevenue   = clients.reduce((s, c) => s + (c.totalValue ?? 0), 0);
  const totalPending   = clients.reduce((s, c) => s + Math.max(0, (c.totalValue ?? 0) - ((c as any).advance_paid ?? 0)), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description="Manage your leads and clients in one place"
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPITile label="Total Leads" value={leads.length} sub={`${wonLeads} won`} color="#6366F1" />
        <KPITile label="Pipeline Value" value={formatCurrency(totalLeadValue)} color="#F59E0B" />
        <KPITile label="Total Clients" value={totalClients} sub={`${formatCurrency(totalRevenue)} contracted`} color="#10B981" />
        <KPITile label="Payments Pending" value={formatCurrency(totalPending)} color="#EF4444" />
      </div>

      {/* Tab switcher + Partner Filter + Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main View Tabs */}
          <div className="flex rounded-xl border border-white/10 bg-white/3 p-1 w-fit">
            {(["leads", "clients"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-ink/50 hover:text-ink/80"
                }`}
              >
                {tab === "leads" ? <Target className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {tab === "leads" ? leads.length : clients.length}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Partner Filter */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/3 p-1 text-xs">
            <button
              type="button"
              onClick={() => setPartnerFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                partnerFilter === "all"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-ink/40 hover:text-ink/80"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setPartnerFilter("Hatim")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                partnerFilter === "Hatim"
                  ? "border border-indigo-500/40 bg-indigo-500/20 text-indigo-300 shadow-sm"
                  : "text-ink/40 hover:text-ink/80"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Hatim{displayName === "Hatim" ? " (Me)" : ""}
            </button>
            <button
              type="button"
              onClick={() => setPartnerFilter("Moiz")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                partnerFilter === "Moiz"
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-ink/40 hover:text-ink/80"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Moiz{displayName === "Moiz" ? " (Me)" : ""}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="h-8 pl-8 text-xs w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab === "clients" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {CLIENT_STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              setEditingLead(null);
              setEditingClient(null);
              if (activeTab === "leads") setLeadFormOpen(true);
              else setClientFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add {activeTab === "leads" ? "Lead" : "Client"}
          </Button>
        </div>
      </div>

      {/* ── Leads Kanban ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "leads" && (
          <motion.div
            key="leads-kanban"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {LEAD_STAGES.map((stage) => (
              <div key={stage.key}>
                <div
                  className="mb-3 flex items-center justify-between px-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-xs font-semibold" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink/40">
                    {leadsByStage[stage.key]?.length ?? 0}
                  </span>
                </div>

                <div className="space-y-2 min-h-[120px] rounded-xl border border-white/5 bg-white/2 p-2">
                  {leadsByStage[stage.key]?.length === 0 && (
                    <p className="py-6 text-center text-[11px] text-ink/25">No leads</p>
                  )}
                  {leadsByStage[stage.key]?.map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        className="p-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
                        onClick={() => { setSelectedLead(lead); setLeadDetailOpen(true); }}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <p className="text-xs font-semibold text-ink line-clamp-1">{lead.company || lead.name}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="shrink-0 p-0.5 text-ink/30 hover:text-ink/70 rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              {LEAD_STAGES.filter((s) => s.key !== stage.key).map((s) => (
                                <DropdownMenuItem key={s.key} onClick={() => moveLeadStage(lead, s.key)}>
                                  <ArrowRight className="mr-2 h-3.5 w-3.5" style={{ color: s.color }} />
                                  Move to {s.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setEditingLead(lead); setLeadFormOpen(true); }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              {stage.key !== "won" && (
                                <DropdownMenuItem
                                  className="text-emerald-400 focus:text-emerald-400"
                                  onClick={() => convertToClient(lead)}
                                >
                                  <UserCheck className="mr-2 h-3.5 w-3.5" /> Convert to Client
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-400"
                                onClick={() => deleteLead.mutate(lead.id)}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {lead.name && lead.company && (
                          <p className="text-[10px] text-ink/50 mb-1.5">{lead.name}</p>
                        )}
                        <p className="text-sm font-bold text-ink tabular">{formatCurrency(lead.value ?? 0)}</p>
                        {lead.phone && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-ink/40">
                            <Phone className="h-2.5 w-2.5" /> {lead.phone}
                          </div>
                        )}
                        {(lead as any).commission_applicable && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400/70">
                            <Percent className="h-2.5 w-2.5" /> Commission
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-ink/30">{lead.source}</span>
                            {lead.assignedTo && lead.assignedTo !== "Unassigned" && (
                              <span
                                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium"
                                style={{
                                  backgroundColor: lead.assignedTo.toLowerCase().includes("hatim")
                                    ? "#6366F120"
                                    : lead.assignedTo.toLowerCase().includes("moiz")
                                    ? "#10B98120"
                                    : "rgba(255,255,255,0.06)",
                                  color: lead.assignedTo.toLowerCase().includes("hatim")
                                    ? "#818CF8"
                                    : lead.assignedTo.toLowerCase().includes("moiz")
                                    ? "#34D399"
                                    : "#9CA3AF",
                                }}
                              >
                                <span
                                  className="h-1 w-1 rounded-full"
                                  style={{
                                    backgroundColor: lead.assignedTo.toLowerCase().includes("hatim")
                                      ? "#818CF8"
                                      : lead.assignedTo.toLowerCase().includes("moiz")
                                      ? "#34D399"
                                      : "#9CA3AF",
                                  }}
                                />
                                {lead.assignedTo}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-ink/50">{lead.probability}%</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Clients Table ─────────────────────────────────────────────── */}
        {activeTab === "clients" && (
          <motion.div
            key="clients-table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            {filteredClients.length === 0 && (
              <div className="py-16 text-center text-ink/40 text-sm">
                No clients found.{" "}
                <button className="text-accent underline" onClick={() => setClientFormOpen(true)}>
                  Add one
                </button>
              </div>
            )}
            {filteredClients.map((client, i) => {
              const totalValue  = client.totalValue ?? 0;
              const advancePaid = (client as any).advance_paid ?? 0;
              const remaining   = Math.max(0, totalValue - advancePaid);
              const pct         = totalValue > 0 ? Math.round((advancePaid / totalValue) * 100) : 0;

              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:border-white/15 transition-colors"
                    onClick={() => { setSelectedClient(client); setClientDetailOpen(true); }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar seed={client.avatarSeed || client.name} size="sm" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-ink truncate">{client.name}</p>
                          <StatusBadge status={client.status} />
                          {((client as any).assignedTo || (client as any).assigned_to) && (
                            <span
                              className="text-[10px] rounded px-1.5 py-0.5 border"
                              style={{
                                borderColor: String((client as any).assignedTo || (client as any).assigned_to).toLowerCase().includes("hatim")
                                  ? "#6366F150"
                                  : "#10B98150",
                                color: String((client as any).assignedTo || (client as any).assigned_to).toLowerCase().includes("hatim")
                                  ? "#818CF8"
                                  : "#34D399",
                                backgroundColor: String((client as any).assignedTo || (client as any).assigned_to).toLowerCase().includes("hatim")
                                  ? "#6366F115"
                                  : "#10B98115",
                              }}
                            >
                              {(client as any).assignedTo || (client as any).assigned_to}
                            </span>
                          )}
                          {(client as any).gst_applicable && (
                            <span className="text-[10px] border border-blue-500/30 text-blue-400 rounded px-1">GST</span>
                          )}
                          {(client as any).commission_applicable && (
                            <span className="text-[10px] border border-amber-500/30 text-amber-400 rounded px-1">Commission</span>
                          )}
                        </div>
                        <p className="text-xs text-ink/50 truncate">{client.company}</p>

                        {/* Payment bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-ink/40 shrink-0">{pct}%</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-sm font-bold text-ink tabular">{formatCurrency(totalValue)}</p>
                        {remaining > 0 ? (
                          <p className="text-[11px] text-amber-400">Due: {formatCurrency(remaining)}</p>
                        ) : (
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </p>
                        )}
                        {client.phone && (
                          <a
                            href={`tel:${client.phone}`}
                            className="text-[10px] text-ink/40 hover:text-ink/70 flex items-center gap-1 justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="h-2.5 w-2.5" /> {client.phone}
                          </a>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 text-ink/30 hover:text-ink/70 rounded ml-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => { setEditingClient(client); setClientFormOpen(true); }}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 focus:text-red-400"
                            onClick={() => deleteClient.mutate(client.id)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lead Drawers ──────────────────────────────────────────────────── */}
      <LeadDrawer
        lead={selectedLead}
        open={leadDetailOpen}
        onClose={() => setLeadDetailOpen(false)}
        onEdit={() => { setEditingLead(selectedLead); setLeadDetailOpen(false); setLeadFormOpen(true); }}
        onConvert={convertToClient}
      />

      <Drawer open={leadFormOpen} onOpenChange={(v) => { if (!v) { setLeadFormOpen(false); setEditingLead(null); } }}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DrawerTitle>
            <DrawerDescription>Fill in the lead details</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <LeadForm
              initial={editingLead ?? undefined}
              onSave={(data) => saveLead.mutate(data)}
              onClose={() => { setLeadFormOpen(false); setEditingLead(null); }}
              isSaving={saveLead.isPending}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Client Drawers ────────────────────────────────────────────────── */}
      <ClientDrawer
        client={selectedClient}
        open={clientDetailOpen}
        onClose={() => setClientDetailOpen(false)}
        onEdit={() => { setEditingClient(selectedClient); setClientDetailOpen(false); setClientFormOpen(true); }}
      />

      <Drawer open={clientFormOpen} onOpenChange={(v) => { if (!v) { setClientFormOpen(false); setEditingClient(null); } }}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader>
            <DrawerTitle>{editingClient ? "Edit Client" : "Add New Client"}</DrawerTitle>
            <DrawerDescription>Fill in client and payment details</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <ClientForm
              initial={editingClient ?? undefined}
              onSave={(data) => saveClient.mutate(data)}
              onClose={() => { setClientFormOpen(false); setEditingClient(null); }}
              isSaving={saveClient.isPending}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// ── KPI Tile ──────────────────────────────────────────────────────────────────
function KPITile({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="px-4 py-3.5">
      <p className="text-[11px] font-medium text-ink/50 mb-1">{label}</p>
      <p className="text-xl font-bold text-ink" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-ink/40 mt-0.5">{sub}</p>}
    </Card>
  );
}
