import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Flame,
  Zap,
  Phone,
  Mail,
  MessageCircle,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  Search,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { WebsiteInquiry } from "@/types";

type InquiryStatus = "all" | "new" | "contacted" | "converted";

function scoreBadge(score: number) {
  if (score >= 70) {
    return {
      icon: <Flame className="h-3 w-3 text-orange-400" />,
      label: "Hot Lead",
      cls: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    };
  }
  if (score >= 40) {
    return {
      icon: <Zap className="h-3 w-3 text-amber-400" />,
      label: "Warm Lead",
      cls: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    };
  }
  return {
    icon: <Sparkles className="h-3 w-3 text-blue-400" />,
    label: "Inquiry",
    cls: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };
}

export function QuotesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<InquiryStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: inquiries = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["website_inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as WebsiteInquiry[];
    },
    refetchInterval: 15000, // auto-refresh every 15s for live quotes
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("website_inquiries")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_inquiries"] });
    },
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("website_inquiries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_inquiries"] });
    },
  });

  const convertToLeadMutation = useMutation({
    mutationFn: async (inquiry: WebsiteInquiry) => {
      // 1. Insert into CRM leads table for pipeline tracking
      const leadId = Math.random().toString(36).substring(2, 9);
      const { error: insertErr } = await supabase.from("leads").insert([
        {
          id: leadId,
          name: inquiry.name,
          company: inquiry.business_type || "Client",
          email: inquiry.email,
          phone: inquiry.phone,
          source: inquiry.source || "Website Quote",
          value: 50000, // initial estimated deal value
          stage: "new",
          probability: Math.min(20 + (inquiry.lead_score || 50), 90),
          assignedTo: "Hatim",
          createdDate: new Date().toISOString().split("T")[0],
          lastContact: new Date().toISOString().split("T")[0],
          businessType: inquiry.business_type,
          branches: inquiry.branches,
          interestedIn: inquiry.interested_in,
          challenge: inquiry.challenge || "",
          timeline: inquiry.timeline,
          leadScore: inquiry.lead_score,
        },
      ]);
      if (insertErr) throw insertErr;

      // 2. Mark inquiry as converted
      const { error: updateErr } = await supabase
        .from("website_inquiries")
        .update({ status: "converted" })
        .eq("id", inquiry.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  // Filter calculations
  const totalInquiries = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const contactedCount = inquiries.filter((i) => i.status === "contacted").length;
  const convertedCount = inquiries.filter((i) => i.status === "converted").length;

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus =
      statusFilter === "all" ? true : inq.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      inq.name?.toLowerCase().includes(query) ||
      inq.email?.toLowerCase().includes(query) ||
      inq.phone?.toLowerCase().includes(query) ||
      inq.business_type?.toLowerCase().includes(query) ||
      inq.challenge?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Quote Inquiries"
        description="Real-time quote requests captured directly from the website's DuoKarma AI Assistant and Get a Quote flow."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-[#C9A876]" : ""}`} />
            Sync
          </Button>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <Card className="p-4 border-white/5 bg-black/40 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            Total Quotes
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink tabular">
            {totalInquiries}
          </p>
          <p className="mt-1 text-[11px] text-ink-faint">From website visitors</p>
        </Card>

        <Card className={`p-4 border transition-colors ${newCount > 0 ? "border-amber-500/40 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "border-white/5 bg-black/40"}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
              New Requests
            </p>
            {newCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-amber-300 tabular">
            {newCount}
          </p>
          <p className="mt-1 text-[11px] text-amber-400/80">Pending follow-up</p>
        </Card>

        <Card className="p-4 border-white/5 bg-black/40 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            Contacted
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink tabular">
            {contactedCount}
          </p>
          <p className="mt-1 text-[11px] text-ink-faint">In negotiation</p>
        </Card>

        <Card className="p-4 border-white/5 bg-black/40 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
            Converted
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-300 tabular">
            {convertedCount}
          </p>
          <p className="mt-1 text-[11px] text-emerald-400/80">
            {totalInquiries > 0
              ? `${Math.round((convertedCount / totalInquiries) * 100)}% conversion rate`
              : "Active leads"}
          </p>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
          {[
            { id: "all", label: "All Quotes", count: totalInquiries, isNewTab: false },
            { id: "new", label: "New", count: newCount, isNewTab: true },
            { id: "contacted", label: "Contacted", count: contactedCount, isNewTab: false },
            { id: "converted", label: "Converted", count: convertedCount, isNewTab: false },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as InquiryStatus)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-[#C9A876] text-[#0A0D14] shadow-sm font-semibold"
                  : "text-ink/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular ${
                  statusFilter === tab.id
                    ? "bg-black/20 text-[#0A0D14]"
                    : tab.isNewTab && tab.count > 0
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/10 text-ink/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="pl-9 h-9 text-xs bg-black/40 border-white/10 placeholder:text-ink/40 focus:border-[#C9A876]"
          />
        </div>
      </div>

      {/* Inquiries Cards Grid */}
      {isLoading ? (
        <Card className="p-12 text-center text-ink-dim border-white/5 bg-black/30">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-[#C9A876]" />
          <p className="text-sm">Loading quote inquiries...</p>
        </Card>
      ) : filteredInquiries.length === 0 ? (
        <Card className="border-white/5 bg-black/30">
          <EmptyState
            icon={ClipboardList}
            title={searchQuery ? "No matching quotes found" : "No quote inquiries in this view"}
            description={
              searchQuery
                ? `No quotes matched "${searchQuery}". Clear your search query to view all.`
                : "When prospective clients complete the Get a Quote flow on the landing page, their detailed submissions appear here automatically."
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredInquiries.map((inq, index) => {
              const score = scoreBadge(inq.lead_score || 50);
              const cleanPhone = inq.phone?.replace(/\D/g, "") || "";
              const formattedDate = inq.created_at
                ? new Date(inq.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Recently";

              const isNew = inq.status === "new";
              const isConverted = inq.status === "converted";

              return (
                <motion.div
                  key={inq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`relative p-5 transition-all overflow-hidden border ${
                      isNew
                        ? "border-amber-500/30 bg-gradient-to-br from-amber-500/[0.04] to-transparent shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                        : "border-white/10 bg-black/40 hover:border-white/20"
                    }`}
                  >
                    {/* Top Accent Ribbon for New */}
                    {isNew && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-[#C9A876] to-transparent" />
                    )}

                    {/* Header Row: Name & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold text-white tracking-tight">
                            {inq.name || "Anonymous Lead"}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${score.cls}`}
                          >
                            {score.icon}
                            {score.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink/60">
                          <span className="flex items-center gap-1 font-medium text-[#C9A876]">
                            <Building2 className="h-3 w-3" />
                            {inq.business_type || "Business"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-ink/50">
                            <Clock className="h-3 w-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <Select
                        value={inq.status || "new"}
                        onValueChange={(val) =>
                          updateStatusMutation.mutate({ id: inq.id, status: val })
                        }
                      >
                        <SelectTrigger className="h-7 w-28 text-[11px] font-semibold border-white/15 bg-white/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <span className="text-amber-400 font-medium">● New</span>
                          </SelectItem>
                          <SelectItem value="contacted">
                            <span className="text-blue-400 font-medium">● Contacted</span>
                          </SelectItem>
                          <SelectItem value="converted">
                            <span className="text-emerald-400 font-medium">● Converted</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Requirements / Challenge Quote Box */}
                    <div className="mt-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-ink/50 mb-1">
                        Requirement / Biggest Challenge
                      </p>
                      <p className="text-xs text-ink/90 leading-relaxed font-sans whitespace-pre-wrap">
                        {inq.challenge || "No additional description provided."}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                      {inq.branches && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-ink/70">
                          Branches: <strong className="text-white font-medium">{inq.branches}</strong>
                        </span>
                      )}
                      {inq.timeline && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-ink/70">
                          Timeline: <strong className="text-white font-medium">{inq.timeline}</strong>
                        </span>
                      )}
                      {inq.source && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-ink/60">
                          Source: {inq.source}
                        </span>
                      )}
                    </div>

                    {/* Contact Actions & Conversion Buttons */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      {/* Direct Channels */}
                      <div className="flex items-center gap-1.5">
                        {inq.phone && (
                          <>
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hi ${inq.name || ""}, thank you for reaching out to DuoKarma regarding your project. We'd love to discuss your custom solution!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                            <a
                              href={`tel:${inq.phone}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-ink/80 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
                              title="Call Client"
                            >
                              <Phone className="h-3 w-3" />
                              {inq.phone}
                            </a>
                          </>
                        )}

                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}?subject=${encodeURIComponent(
                              `DuoKarma Proposal for ${inq.business_type || "Your Project"}`
                            )}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-ink/80 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="h-3 w-3" />
                            Email
                          </a>
                        )}
                      </div>

                      {/* Convert to Lead or Delete */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {!isConverted ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => convertToLeadMutation.mutate(inq)}
                            disabled={convertToLeadMutation.isPending}
                            className="h-7 text-xs gap-1 bg-[#C9A876] hover:bg-[#B39362] text-[#0A0D14] font-semibold shadow-sm"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Convert to CRM
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            In Pipeline
                          </Badge>
                        )}

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm(`Delete quote inquiry from ${inq.name || "this client"}?`)) {
                              deleteInquiryMutation.mutate(inq.id);
                            }
                          }}
                          className="h-7 w-7 text-ink-faint hover:text-rose hover:bg-rose/10"
                          title="Delete Quote"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
