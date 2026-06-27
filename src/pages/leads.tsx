import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Lead } from "@/types";

const stages: { key: Lead["stage"]; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-violet" },
  { key: "qualified", label: "Qualified", color: "bg-cyan" },
  { key: "proposal", label: "Proposal", color: "bg-electric" },
  { key: "negotiation", label: "Negotiation", color: "bg-amber" },
  { key: "won", label: "Won", color: "bg-emerald" },
];

function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="cursor-pointer p-4 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink">{lead.company}</p>
          <Badge variant="outline" className="shrink-0">
            {lead.probability}%
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">{lead.name}</p>
        <p className="mt-2 font-display text-base font-semibold text-ink tabular">
          {formatCurrency(lead.value)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar seed={lead.assignedTo} size="xs" />
            <span className="text-[11px] text-ink-faint">{lead.assignedTo}</span>
          </div>
          <span className="text-[11px] text-ink-faint">{lead.source}</span>
        </div>
      </Card>
    </motion.div>
  );
}

export function LeadsPage() {
  const [showLost, setShowLost] = useState(false);
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw error;
      return data as Lead[];
    },
  });
  const totalPipelineValue = leads
    .filter((l) => l.stage !== "lost" && l.stage !== "won")
    .reduce((sum, l) => sum + l.value, 0);

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${formatCurrency(totalPipelineValue)} in active pipeline across ${leads.length} leads`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowLost((s) => !s)}>
              {showLost ? "Hide" : "Show"} Lost
            </Button>
            <Button>
              <Plus className="h-4 w-4" /> New Lead
            </Button>
          </>
        }
      />

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-ink-dim">Loading leads...</div>
        </Card>
      ) : (
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
                  stageLeads.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} />)
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
                  <LeadCard key={lead.id} lead={lead} index={i} />
                ))}
            </div>
          )}
      )}
    </div>
  );
}
