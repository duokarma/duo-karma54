import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, MoreVertical, Pencil, Trash2, Phone, Flame, Zap, ClipboardList, ArrowRight, RefreshCw, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Lead, WebsiteInquiry } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── CRM Kanban ──────────────────────────────────────────────────────────────

const stages: { key: Lead["stage"]; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-violet" },
  { key: "negotiation", label: "Negotiation", color: "bg-amber" },
  { key: "won", label: "Won", color: "bg-emerald" },
];

function LeadCard({ lead, index, onClick, onEdit, onDelete }: { lead: Lead; index: number; onClick: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink cursor-pointer flex-1" onClick={onClick}>{lead.company}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0">
              {lead.probability}%
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="-mr-2 h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-rose focus:text-rose">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-ink-faint cursor-pointer" onClick={onClick}>{lead.name}</p>
        <p className="mt-2 font-display text-base font-semibold text-ink tabular cursor-pointer" onClick={onClick}>
          {formatCurrency(lead.value)}
        </p>
        <div className="mt-3 flex items-center justify-between cursor-pointer" onClick={onClick}>
          <div className="flex items-center gap-1.5">
            <Avatar seed={lead.assignedTo} size="xs" />
            <span className="text-[11px] text-ink-faint">{lead.assignedTo}</span>
          </div>
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-surface text-ink-faint border border-edge">{lead.source}</span>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Website Inquiry Card ─────────────────────────────────────────────────────

type InquiryStatus = "all" | "new" | "contacted";

function scoreLabel(score: number): { icon: React.ReactNode; label: string; color: string } {
  if (score >= 50) return { icon: <Flame className="h-3 w-3" />, label: "Hot", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" };
  if (score >= 20) return { icon: <Zap className="h-3 w-3" />, label: "Warm", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" };
  return { icon: <ClipboardList className="h-3 w-3" />, label: "New", color: "text-ink-faint bg-surface border-edge" };
}

function InquiryCard({
  inquiry,
  index,
  onConvert,
  onStatusChange,
}: {
  inquiry: WebsiteInquiry;
  index: number;
  onConvert: () => void;
  onStatusChange: (status: "new" | "contacted") => void;
}) {
  const badge = scoreLabel(inquiry.lead_score);
  const createdAt = new Date(inquiry.created_at);
  const timeAgo = (() => {
    const diffMs = Date.now() - createdAt.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{inquiry.name}</p>
            <p className="text-xs text-ink-faint mt-0.5 truncate">{inquiry.email}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium shrink-0 ${badge.color}`}>
            {badge.icon}
            <span>{badge.label}</span>
            <span className="ml-0.5 opacity-60">·{inquiry.lead_score}pts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">Business</p>
            <p className="text-xs text-ink font-medium">{inquiry.business_type}</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">Branches</p>
            <p className="text-xs text-ink font-medium">{inquiry.branches}</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">Interested In</p>
            <p className="text-xs text-ink font-medium">{inquiry.interested_in}</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">Timeline</p>
            <p className="text-xs text-ink font-medium">{inquiry.timeline}</p>
          </div>
        </div>

        {inquiry.challenge && (
          <p className="text-xs text-ink-faint italic border-l-2 border-edge pl-3 mb-3 line-clamp-2">
            "{inquiry.challenge}"
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-edge">
          <div className="flex items-center gap-3">
            <a
              href={`tel:${inquiry.phone}`}
              className="flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors"
            >
              <Phone className="h-3 w-3" />
              {inquiry.phone}
            </a>
            <span className="text-[10px] text-ink-faint">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {inquiry.status === "new" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={() => onStatusChange("contacted")}
              >
                <RefreshCw className="h-2.5 w-2.5 mr-1" /> Mark Contacted
              </Button>
            )}
            <Button
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={onConvert}
            >
              <ArrowRight className="h-2.5 w-2.5 mr-1" /> Convert
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const defaultFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Website",
  value: 0,
  stage: "new" as Lead["stage"],
  probability: 20,
  assignedTo: "Hatim",
  businessType: "",
  branches: "",
  interestedIn: "",
  challenge: "",
  timeline: "",
  leadScore: 0
};

export function LeadsPage() {
  const [showLost, setShowLost] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState<InquiryStatus>("all");
  const [kanbanSourceFilter, setKanbanSourceFilter] = useState<string>("all");

  const { data: allLeads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw error;
      return data as Lead[];
    },
  });

  const leads = allLeads.filter(l => kanbanSourceFilter === "all" || l.source === kanbanSourceFilter);

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ["website_inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_inquiries")
        .select("*")
        .order("lead_score", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WebsiteInquiry[];
    },
  });

  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const createMutation = useMutation({
    mutationFn: async (newLead: Partial<Lead>) => {
      const { data, error } = await supabase.from("leads").insert([{
        ...newLead,
        id: Math.random().toString(36).substring(2, 9),
        createdDate: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0]
      }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsDialogOpen(false);
      setFormData(defaultFormData);
    }
  });

  const editMutation = useMutation({
    mutationFn: async (updatedLead: Partial<Lead>) => {
      const { data, error } = await supabase.from("leads").update(updatedLead).eq("id", updatedLead.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsDialogOpen(false);
      setSelectedLead(null);
      setFormData(defaultFormData);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const updateInquiryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "new" | "contacted" }) => {
      const { error } = await supabase.from("website_inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["website_inquiries"] }),
  });

  const convertInquiry = useMutation({
    mutationFn: async (inquiry: WebsiteInquiry) => {
      // Insert into CRM leads table
      const { error: insertError } = await supabase.from("leads").insert([{
        id: Math.random().toString(36).substring(2, 9),
        name: inquiry.name,
        company: inquiry.business_type,
        email: inquiry.email,
        phone: inquiry.phone,
        source: "Website",
        value: 0,
        stage: "new",
        probability: Math.min(10 + inquiry.lead_score, 90),
        assignedTo: "Hatim",
        createdDate: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        businessType: inquiry.business_type,
        branches: inquiry.branches,
        interestedIn: inquiry.interested_in,
        challenge: inquiry.challenge || "",
        timeline: inquiry.timeline,
        leadScore: inquiry.lead_score,
      }]);
      if (insertError) throw insertError;
      // Mark inquiry as converted
      const { error: updateError } = await supabase
        .from("website_inquiries")
        .update({ status: "converted" })
        .eq("id", inquiry.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["website_inquiries"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLead) {
      editMutation.mutate({ ...formData, id: selectedLead.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source,
      value: lead.value,
      stage: lead.stage,
      probability: lead.probability,
      assignedTo: lead.assignedTo,
      businessType: lead.businessType || "",
      branches: lead.branches || "",
      interestedIn: lead.interestedIn || "",
      challenge: lead.challenge || "",
      timeline: lead.timeline || "",
      leadScore: lead.leadScore || 0,
    });
    setIsDialogOpen(true);
  };

  const totalPipelineValue = leads
    .filter((l) => l.stage !== "lost" && l.stage !== "won")
    .reduce((sum, l) => sum + l.value, 0);

  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryFilter === "all") return inq.status !== "converted";
    return inq.status === inquiryFilter;
  });

  const hotCount = inquiries.filter((i) => i.lead_score >= 50 && i.status !== "converted").length;

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${formatCurrency(totalPipelineValue)} in active pipeline across ${leads.length} leads`}
        actions={
          <>
            <div className="flex items-center gap-2 mr-2">
              <Filter className="h-4 w-4 text-ink-faint" />
              <Select value={kanbanSourceFilter} onValueChange={setKanbanSourceFilter}>
                <SelectTrigger className="h-8 text-xs border-edge bg-surface w-[140px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Cold Calling">Cold Calling</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowLost((s) => !s)}>
              {showLost ? "Hide" : "Show"} Lost
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setSelectedLead(null);
                setFormData(defaultFormData);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> New Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{selectedLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Contact Name</Label>
                      <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company / Business</Label>
                      <Input id="company" required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Select value={formData.source} onValueChange={(val) => setFormData({...formData, source: val})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cold Calling">Cold Calling</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Website">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Estimated Value (₹)</Label>
                      <Input id="value" type="number" required min="0" value={formData.value || ""} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} />
                    </div>
                    
                    {/* Extra Details */}
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type (e.g. Salon)</Label>
                      <Input id="businessType" value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branches">Branches</Label>
                      <Input id="branches" value={formData.branches} onChange={(e) => setFormData({...formData, branches: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interestedIn">Interested In</Label>
                      <Input id="interestedIn" value={formData.interestedIn} onChange={(e) => setFormData({...formData, interestedIn: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline</Label>
                      <Input id="timeline" value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leadScore">Lead Score</Label>
                      <Input id="leadScore" type="number" value={formData.leadScore} onChange={(e) => setFormData({...formData, leadScore: Number(e.target.value)})} />
                    </div>
                    {selectedLead && (
                      <div className="space-y-2">
                        <Label>Stage</Label>
                        <Select
                          value={formData.stage}
                          onValueChange={(val) => setFormData({...formData, stage: val as Lead["stage"]})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {stages.map(s => (
                              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                            ))}
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="challenge">Biggest Challenge</Label>
                    <textarea 
                      id="challenge" 
                      className="flex min-h-[80px] w-full resize-none rounded-[var(--radius-control)] border border-[var(--color-edge)] bg-[var(--color-card)] px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-none focus-visible:border-[#2563EB]/60 focus-visible:ring-1 focus-visible:ring-[#2563EB]/30 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={2} 
                      value={formData.challenge} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, challenge: e.target.value})} 
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary" type="button">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createMutation.isPending || editMutation.isPending}>
                      {createMutation.isPending || editMutation.isPending ? "Saving..." : selectedLead ? "Save Changes" : "Save Lead"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* ── CRM Kanban ── */}
      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-ink-dim">Loading leads...</div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stages.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage.key);
              return (
                <div key={stage.key}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{stage.label}</p>
                    <span className="ml-auto text-xs text-ink-faint tabular">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.length === 0 ? (
                      <div className="rounded-[var(--radius-card)] border border-dashed border-edge p-6 text-center text-xs text-ink-faint">
                        No leads
                      </div>
                    ) : (
                      stageLeads.map((lead, i) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          index={i}
                          onClick={() => openEditDialog(lead)}
                          onEdit={() => openEditDialog(lead)}
                          onDelete={() => deleteMutation.mutate(lead.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {showLost && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Lost Leads</p>
              {leads.filter((l) => l.stage === "lost").length === 0 ? (
                <Card>
                  <EmptyState icon={Target} title="No lost leads" description="All leads are still active or won." />
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {leads
                    .filter((l) => l.stage === "lost")
                    .map((lead, i) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        index={i}
                        onClick={() => openEditDialog(lead)}
                        onEdit={() => openEditDialog(lead)}
                        onDelete={() => deleteMutation.mutate(lead.id)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Website Inquiries Section ── */}
      <div className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Website Inquiries
            </p>
            {hotCount > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-[11px] font-medium text-orange-400">
                <Flame className="h-3 w-3" /> {hotCount} hot
              </span>
            )}
            <span className="text-xs text-ink-faint tabular">{filteredInquiries.length}</span>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            {(["all", "new", "contacted"] as InquiryStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setInquiryFilter(f)}
                className={`rounded-md px-3 py-1 text-[12px] font-medium capitalize transition-colors ${
                  inquiryFilter === f
                    ? "bg-surface text-ink border border-edge"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {inquiriesLoading ? (
          <Card>
            <div className="p-8 text-center text-ink-dim">Loading inquiries…</div>
          </Card>
        ) : filteredInquiries.length === 0 ? (
          <Card>
            <EmptyState
              icon={ClipboardList}
              title="No website inquiries yet"
              description="Inquiries submitted through the contact conversation flow will appear here."
            />
          </Card>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInquiries.map((inq, i) => (
                <InquiryCard
                  key={inq.id}
                  inquiry={inq}
                  index={i}
                  onConvert={() => convertInquiry.mutate(inq)}
                  onStatusChange={(status) => updateInquiryStatus.mutate({ id: inq.id, status })}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
