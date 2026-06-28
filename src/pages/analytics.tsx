import { Activity, Users, Target, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientGrowthChart, LeadConversionChart } from "@/components/charts/misc-charts";
import { Avatar } from "@/components/shared/avatar";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MetricPoint, TeamMember, Project } from "@/types";

export function AnalyticsPage() {
  const { data: clientGrowth = [], isLoading: isLoadingCG } = useQuery({
    queryKey: ["client_growth"],
    queryFn: async () => {
      const { data, error } = await supabase.from("client_growth").select("*").order("orderIndex");
      if (error) throw error;
      return data as MetricPoint[];
    },
  });

  const { data: leadConversion = [], isLoading: isLoadingLC } = useQuery({
    queryKey: ["lead_conversion"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lead_conversion").select("*").order("orderIndex");
      if (error) throw error;
      return data as MetricPoint[];
    },
  });

  const { data: team = [], isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*");
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const { data: projects = [], isLoading: isLoadingProj } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data as Project[];
    },
  });

  const teamPerformance = team.map((member, i) => ({
    ...member,
    utilization: [88, 94, 76, 82][i] ?? 80,
    projectsActive: projects.filter((p) => p.team.includes(member.name) && p.status === "in-progress").length,
  }));

  if (isLoadingCG || isLoadingLC || isLoadingTeam || isLoadingProj) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Deeper insight into growth, conversion, and team performance" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Conversion Rate" value={16.7} suffix="%" change={4.2} icon={Target} accent="blue" decimals={1} />
        <KPICard label="Avg. Deal Cycle" value={34} suffix=" days" change={-8.1} icon={Clock} accent="amber" />
        <KPICard label="Client Retention" value={94.2} suffix="%" change={1.8} icon={Users} accent="green" decimals={1} />
        <KPICard label="Team Utilization" value={85} suffix="%" change={2.5} icon={Activity} accent="amber" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientGrowthChart data={clientGrowth.map(d => ({ label: d.label, clients: d.value }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadConversionChart data={leadConversion} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamPerformance.map((member) => (
            <div key={member.id} className="flex items-center gap-4">
              <Avatar seed={member.avatarSeed} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{member.name}</p>
                  <span className="text-xs text-ink-faint tabular">{member.utilization}%</span>
                </div>
                <p className="text-xs text-ink-faint">
                  {member.role} · {member.projectsActive} active project{member.projectsActive !== 1 ? "s" : ""}
                </p>
                <Progress value={member.utilization} className="mt-2 h-1.5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
