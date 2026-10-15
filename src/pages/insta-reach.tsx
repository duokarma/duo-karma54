import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Phone,
  Copy,
  Check,
  Trash2,
  Filter,
  Sparkles,
  Send,
  Building,
  ChevronDown,
  Database,
  MessageSquare,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import type { InstaReachLead, InstaLeadStatus } from "@/types";

// ── Default Initial Leads (The 3 Real Dubai Prospects) ──────────────────────
const DEFAULT_LEADS: InstaReachLead[] = [
  {
    id: "lead-ptc-luxe",
    insta_handle: "ptcluxe",
    insta_name: "Beauty Salon Dubai | PTC Luxe",
    direct_link: "https://instagram.com/ptcluxe",
    location: "Aurora Tower - Marina - Shop No 5 - Marina Promenade, Dubai Marina",
    category: "Luxury Salon & Beauty",
    phone: "+971 545434664",
    whatsapp_link: "https://wa.me/971545434664",
    status: "dm_sent",
    notes: "Tested WhatsApp line: got default greeting, no automated booking bot. Sent IG DM opener.",
    created_day_date: "Sunday, 11 Oct 2026 • 04:30 PM",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "lead-eser-barber",
    insta_handle: "eser_turkish__gents_salon",
    insta_name: "Eser Turkish Gents Salon 💈",
    direct_link: "https://instagram.com/eser_turkish__gents_salon",
    location: "Al Barsha 1, Dubai UAE",
    category: "Barbershop",
    phone: "+971 50 871 7868",
    whatsapp_link: "https://wa.me/971508717868",
    status: "dm_sent",
    notes: "Has no booking link in bio, only Google Maps link. Sent IG DM for haircut/beard automation.",
    created_day_date: "Sunday, 11 Oct 2026 • 04:40 PM",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "lead-goodluck-salon",
    insta_handle: "goodlucksalon.ae",
    insta_name: "Good Luck Salon",
    direct_link: "https://instagram.com/goodlucksalon.ae",
    location: "China Tower Shop - 2 Baniyas Rd, Al Rigga, Deira, Dubai",
    category: "Beauty & Hair Salon",
    phone: "",
    whatsapp_link: "https://linktr.ee/GoodLuckSalon.ae",
    status: "new",
    notes: "High-volume salon with AED 380 hair coloring posts. Uses Linktree funnel leak.",
    created_day_date: "Sunday, 11 Oct 2026 • 04:45 PM",
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
];

const STATUS_CONFIG: Record<
  InstaLeadStatus,
  { label: string; color: string; bg: string; dot: string; variant: "default" | "success" | "warning" | "danger" | "info" | "violet" }
> = {
  new: { label: "New Lead", color: "#60A5FA", bg: "#2563EB15", dot: "#3B82F6", variant: "info" },
  dm_sent: { label: "DM Sent", color: "#FBBF24", bg: "#F59E0B15", dot: "#F59E0B", variant: "warning" },
  replied: { label: "Replied 🔥", color: "#A78BFA", bg: "#7C3AED15", dot: "#8B5CF6", variant: "violet" },
  video_sent: { label: "Video Sent", color: "#38BDF8", bg: "#0284C715", dot: "#0EA5E9", variant: "info" },
  call_booked: { label: "Call Booked", color: "#34D399", bg: "#05966915", dot: "#10B981", variant: "success" },
  won: { label: "Won / Client 🎉", color: "#10B981", bg: "#10B98125", dot: "#10B981", variant: "success" },
  lost: { label: "Archived", color: "#9CA3AF", bg: "#6B728015", dot: "#6B7280", variant: "default" },
};

export function formatCurrentDayDateTime(): string {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[now.getDay()];
  const dateNum = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hoursFormatted = hours.toString().padStart(2, "0");
  
  return `${dayName}, ${dateNum} ${monthName} ${year} • ${hoursFormatted}:${minutes} ${ampm}`;
}

export function InstaReachPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<InstaReachLead[]>(() => {
    try {
      const saved = localStorage.getItem("dk_insta_reach_leads");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LEADS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [scriptModalLead, setScriptModalLead] = useState<InstaReachLead | null>(null);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  // Form State for Adding Lead
  const [formHandle, setFormHandle] = useState("");
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState("Salon & Beauty");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<InstaLeadStatus>("new");

  // Sync with Supabase on mount
  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const { data, error } = await supabase
          .from("insta_reach_leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          // If table doesn't exist yet, fallback to localStorage
          console.warn("Supabase table not initialized yet, using local leads:", error.message);
        } else if (data && data.length > 0) {
          setLeads(data as InstaReachLead[]);
          localStorage.setItem("dk_insta_reach_leads", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    }
    fetchFromSupabase();
  }, []);

  // Save to localStorage whenever leads change
  const saveLeadsLocally = (updated: InstaReachLead[]) => {
    setLeads(updated);
    try {
      localStorage.setItem("dk_insta_reach_leads", JSON.stringify(updated));
    } catch {}
  };

  // Add new lead handler
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHandle.trim() || !formLocation.trim()) {
      toast({ title: "Required fields missing", description: "Please enter an Instagram handle and client location." });
      return;
    }

    const cleanHandle = formHandle.replace(/^@/, "").trim();
    const directLink = `https://instagram.com/${cleanHandle}`;
    const cleanPhone = formPhone.trim();
    const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone.replace(/[^0-9]/g, "")}` : "";
    const dayDateTime = formatCurrentDayDateTime();

    const newLead: InstaReachLead = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}`,
      insta_handle: cleanHandle,
      insta_name: formName.trim() || cleanHandle,
      direct_link: directLink,
      location: formLocation.trim(),
      category: formCategory,
      phone: cleanPhone,
      whatsapp_link: whatsappLink,
      status: formStatus,
      notes: formNotes.trim(),
      created_day_date: dayDateTime,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    const updated = [newLead, ...leads];
    saveLeadsLocally(updated);

    // Persist to Supabase if table exists
    try {
      await supabase.from("insta_reach_leads").insert([newLead]);
    } catch (err) {
      console.warn("Supabase insert queued locally:", err);
    }

    toast({
      title: "Lead Added to Insta Reach! 🚀",
      description: `@${cleanHandle} recorded with timestamp: ${dayDateTime}`,
    });

    // Reset Form
    setFormHandle("");
    setFormName("");
    setFormLocation("");
    setFormPhone("");
    setFormNotes("");
    setFormStatus("new");
    setIsAddOpen(false);
  };

  // Update lead status
  const handleStatusChange = async (leadId: string, newStatus: InstaLeadStatus) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    saveLeadsLocally(updated);

    try {
      await supabase.from("insta_reach_leads").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", leadId);
    } catch {}

    toast({ title: "Status Updated", description: `Lead moved to ${STATUS_CONFIG[newStatus].label}` });
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const updated = leads.filter((l) => l.id !== leadId);
    saveLeadsLocally(updated);

    try {
      await supabase.from("insta_reach_leads").delete().eq("id", leadId);
    } catch {}

    toast({ title: "Lead Deleted" });
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.insta_handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.insta_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.category && lead.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, selectedStatus]);

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const dmsSent = leads.filter((l) => l.status === "dm_sent").length;
    const replied = leads.filter((l) => l.status === "replied" || l.status === "video_sent" || l.status === "call_booked").length;
    const won = leads.filter((l) => l.status === "won").length;
    return { total, dmsSent, replied, won };
  }, [leads]);

  // Copy helper
  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (typeof index === "number") {
      setCopiedScriptIndex(index);
      setTimeout(() => setCopiedScriptIndex(null), 2000);
    }
    toast({ title: "Copied to Clipboard! 📋" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Insta Reach — Dubai Outbound"
        description="High-ticket client acquisition engine for salons, gyms, and clinics in Dubai & UAE."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSqlModalOpen(true)}
              className="border-[var(--color-edge)] hover:bg-white/5 text-ink-dim"
            >
              <Database className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
              Supabase SQL
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-md"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Insta Lead
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border-[var(--color-edge)] bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>Total Tracked</span>
              <Building className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-ink">{metrics.total}</div>
            <p className="mt-1 text-[11px] text-ink-faint">Dubai lifestyle businesses</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-edge)] bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>DMs Dispatched</span>
              <Send className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-400">{metrics.dmsSent}</div>
            <p className="mt-1 text-[11px] text-ink-faint">Openers sent on Instagram</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-edge)] bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>In Conversation</span>
              <Flame className="h-4 w-4 text-violet-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-violet-400">{metrics.replied}</div>
            <p className="mt-1 text-[11px] text-ink-faint">Active replies & video reviews</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-edge)] bg-card/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>Pilots / Closed</span>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-400">{metrics.won}</div>
            <p className="mt-1 text-[11px] text-ink-faint">5,500 AED + 750 AED/mo</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <Input
            placeholder="Search by @handle, salon name, or Dubai location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/40 border-[var(--color-edge)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-faint flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-[var(--color-edge)] bg-card px-2.5 py-1.5 text-xs text-ink outline-none"
          >
            <option value="all">All Statuses ({leads.length})</option>
            <option value="new">New Leads</option>
            <option value="dm_sent">DM Sent</option>
            <option value="replied">Replied 🔥</option>
            <option value="video_sent">Video Sent</option>
            <option value="call_booked">Call Booked</option>
            <option value="won">Won / Closed</option>
            <option value="lost">Archived</option>
          </select>
        </div>
      </div>

      {/* Leads Table / List */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-edge)] bg-card/30 backdrop-blur-md">
        <div className="divide-y divide-[var(--color-edge)]">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-ink-faint opacity-50" />
              <p className="mt-2 text-sm font-medium text-ink-dim">No Instagram leads found</p>
              <p className="text-xs text-ink-faint">Add your first lead using the "Add Insta Lead" button above.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;

              return (
                <div
                  key={lead.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Lead Identity & Account Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-white/10 text-pink-400 font-bold text-sm shadow-inner">
                      @{lead.insta_handle.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink text-sm sm:text-base">
                          {lead.insta_name}
                        </span>
                        <a
                          href={lead.direct_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-pink-500/10 px-2 py-0.5 text-xs font-medium text-pink-400 hover:bg-pink-500/20 transition-colors"
                        >
                          @{lead.insta_handle}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        {lead.category && (
                          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-ink-faint">
                            {lead.category}
                          </span>
                        )}
                      </div>

                      {/* Location with Pin Icon */}
                      <div className="flex items-center gap-1 text-xs text-amber-400/90 font-medium">
                        <MapPin className="h-3 w-3 shrink-0 text-amber-400" />
                        <span>{lead.location}</span>
                      </div>

                      {/* Day, Date & Time of adding lead */}
                      <div className="flex items-center gap-1 text-[11px] text-ink-faint">
                        <Clock className="h-3 w-3 shrink-0 text-emerald-400/70" />
                        <span>Added: {lead.created_day_date || "Timestamp logged"}</span>
                      </div>

                      {/* Notes snippet if present */}
                      {lead.notes && (
                        <p className="text-xs text-ink-dim/80 pt-0.5 line-clamp-1 italic">
                          "{lead.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions, Direct Links & Status Dropdown */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Status Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-[var(--color-edge)] text-xs font-medium flex items-center gap-1.5"
                          style={{ color: statusCfg.color }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.dot }}
                          />
                          {statusCfg.label}
                          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <DropdownMenuItem
                            key={key}
                            onClick={() => handleStatusChange(lead.id, key as InstaLeadStatus)}
                            className="text-xs flex items-center gap-2"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: cfg.dot }}
                            />
                            {cfg.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Quick WhatsApp Action if present */}
                    {lead.whatsapp_link && (
                      <a
                        href={lead.whatsapp_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        WhatsApp
                      </a>
                    )}

                    {/* Copy Customized Pitch Script */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScriptModalLead(lead)}
                      className="h-8 border-[var(--color-edge)] hover:bg-white/5 text-xs text-ink-dim"
                    >
                      <Copy className="h-3 w-3 mr-1 text-amber-400" />
                      Scripts
                    </Button>

                    {/* Delete Lead */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="h-8 w-8 p-0 text-ink-faint hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── ADD LEAD MODAL ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Add Instagram Lead
            </DialogTitle>
            <DialogDescription>
              Record a new Dubai business lead. Exact day, date, and time will be captured automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLead} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-medium text-ink-dim">Instagram Handle *</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-xs">@</span>
                <Input
                  placeholder="ptcluxe"
                  value={formHandle}
                  onChange={(e) => setFormHandle(e.target.value)}
                  className="pl-7 bg-card/60 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-dim">Account / Business Name</label>
              <Input
                placeholder="Beauty Salon Dubai | PTC Luxe"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 bg-card/60 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-dim">Location in Dubai *</label>
              <Input
                placeholder="Aurora Tower - Marina Promenade, Dubai Marina"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="mt-1 bg-card/60 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-dim">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--color-edge)] bg-card px-2.5 py-2 text-xs text-ink outline-none"
                >
                  <option value="Salon & Beauty">Salon & Beauty</option>
                  <option value="Barbershop">Barbershop</option>
                  <option value="Gym & Fitness">Gym & Fitness</option>
                  <option value="Clinic & Spa">Clinic & Spa</option>
                  <option value="Consultancy / Agency">Consultancy / Agency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-dim">Initial Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as InstaLeadStatus)}
                  className="mt-1 w-full rounded-md border border-[var(--color-edge)] bg-card px-2.5 py-2 text-xs text-ink outline-none"
                >
                  <option value="new">New Lead</option>
                  <option value="dm_sent">DM Sent</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-dim">Phone / WhatsApp Number (Optional)</label>
              <Input
                placeholder="+971 545434664"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="mt-1 bg-card/60 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-dim">Notes / Funnel Observations</label>
              <Input
                placeholder="Tested WhatsApp: got default greeting, no live booking bot."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="mt-1 bg-card/60 text-xs"
              />
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400 flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Timestamp will log as: <strong>{formatCurrentDayDateTime()}</strong></span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                Save Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── SCRIPT GENERATOR MODAL ── */}
      {scriptModalLead && (
        <Dialog open={!!scriptModalLead} onOpenChange={() => setScriptModalLead(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-amber-400" />
                Customized Scripts for @{scriptModalLead.insta_handle}
              </DialogTitle>
              <DialogDescription>
                Tailored for {scriptModalLead.insta_name} in {scriptModalLead.location}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Script 1: Instagram Opener */}
              <div className="rounded-lg border border-[var(--color-edge)] bg-card/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400">Step 1: Instagram Opener (Send First)</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-ink-dim hover:text-white"
                    onClick={() => {
                      const text = `Hey ${scriptModalLead.insta_name.split("|")[0].trim()} team! Love the aesthetic at your ${scriptModalLead.location.split("-")[0].trim()} branch 🔥\n\nQuick question—are you guys handling all your customer bookings through WhatsApp manually, or do you have an automated system for that?`;
                      copyToClipboard(text, 1);
                    }}
                  >
                    {copiedScriptIndex === 1 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-ink-dim font-mono leading-relaxed bg-black/40 p-2.5 rounded">
                  Hey {scriptModalLead.insta_name.split("|")[0].trim()} team! Love the aesthetic at your {scriptModalLead.location.split("-")[0].trim()} branch 🔥{"\n\n"}
                  Quick question—are you guys handling all your customer bookings through WhatsApp manually, or do you have an automated system for that?
                </p>
              </div>

              {/* Script 2: When they reply */}
              <div className="rounded-lg border border-[var(--color-edge)] bg-card/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-400">Step 2: When They Reply (Offer Video)</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-ink-dim hover:text-white"
                    onClick={() => {
                      const text = `Awesome, the reason I ask is we build 24/7 AI WhatsApp booking concierges specifically for luxury salons in ${scriptModalLead.location.split(",")[0].trim()}.\n\nIt checks live availability, answers service questions, and locks in appointments in 15 seconds—especially after 8 PM when reception is closed (cutting no-shows by 40%).\n\nI actually recorded a quick 45-second screen demo showing how it works with your actual menu.\n\nMind if I send the quick link over for your team to check out?`;
                      copyToClipboard(text, 2);
                    }}
                  >
                    {copiedScriptIndex === 2 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-ink-dim font-mono leading-relaxed bg-black/40 p-2.5 rounded">
                  Awesome, the reason I ask is we build 24/7 AI WhatsApp booking concierges specifically for luxury studios in {scriptModalLead.location.split(",")[0].trim()}.{"\n\n"}
                  It answers questions, checks live availability, and locks in appointments in 15 seconds—especially after 8 PM (cutting no-shows by 40%).{"\n\n"}
                  I actually recorded a quick 45-second screen demo showing how it works for your brand. Mind if I send the link over?
                </p>
              </div>

              {/* Direct Instagram Link */}
              <div className="pt-2 flex justify-between items-center">
                <a
                  href={scriptModalLead.direct_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:underline"
                >
                  Open @{scriptModalLead.insta_handle} on Instagram
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Button size="sm" variant="outline" onClick={() => setScriptModalLead(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── SUPABASE SQL MODAL ── */}
      <Dialog open={sqlModalOpen} onOpenChange={setSqlModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              Supabase SQL Query for Insta Reach
            </DialogTitle>
            <DialogDescription>
              Copy and execute this script once in your Supabase SQL Editor to persist all leads across devices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <pre className="max-h-60 overflow-y-auto rounded-lg bg-black/80 border border-[var(--color-edge)] p-3 text-[11px] font-mono text-emerald-400">
{`CREATE TABLE IF NOT EXISTS public.insta_reach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insta_handle TEXT NOT NULL,
    insta_name TEXT NOT NULL,
    direct_link TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT DEFAULT 'Salon & Beauty',
    phone TEXT,
    whatsapp_link TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_day_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insta_reach_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to insta_reach_leads" ON public.insta_reach_leads;
CREATE POLICY "Allow full access to insta_reach_leads" 
ON public.insta_reach_leads FOR ALL USING (true) WITH CHECK (true);`}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                onClick={() => {
                  const sql = `CREATE TABLE IF NOT EXISTS public.insta_reach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insta_handle TEXT NOT NULL,
    insta_name TEXT NOT NULL,
    direct_link TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT DEFAULT 'Salon & Beauty',
    phone TEXT,
    whatsapp_link TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_day_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insta_reach_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to insta_reach_leads" ON public.insta_reach_leads;
CREATE POLICY "Allow full access to insta_reach_leads" 
ON public.insta_reach_leads FOR ALL USING (true) WITH CHECK (true);`;
                  copyToClipboard(sql);
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy SQL Script
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
