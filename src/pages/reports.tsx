import { Download, FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialsAreaChart } from "@/components/charts/financials-area-chart";
import { ClientGrowthChart, LeadConversionChart } from "@/components/charts/misc-charts";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { Project, ChartPoint, MetricPoint } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const projectColumns: Column<Project>[] = [
  { key: "name", header: "Project", sortValue: (p) => p.name, render: (p) => <span className="text-ink">{p.name}</span> },
  { key: "client", header: "Client", sortValue: (p) => p.client, render: (p) => p.client },
  { key: "status", header: "Status", sortValue: (p) => p.status, render: (p) => <StatusBadge status={p.status} /> },
  { key: "budget", header: "Budget", align: "right", sortValue: (p) => p.budget, render: (p) => <span className="tabular">{formatCurrency(p.budget)}</span> },
  { key: "spent", header: "Spent", align: "right", sortValue: (p) => p.spent, render: (p) => <span className="tabular">{formatCurrency(p.spent)}</span> },
];

export function ReportsPage() {
  const { data: monthlyFinancials = [], isLoading: isLoadingFin } = useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_metrics").select("*").order("orderIndex");
      if (error) throw error;
      return data as ChartPoint[];
    },
  });

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

  const { data: projects = [], isLoading: isLoadingProj } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data as Project[];
    },
  });

  if (isLoadingFin || isLoadingCG || isLoadingLC || isLoadingProj) {
    return <div className="p-8 text-center text-ink-dim">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and export structured reports across your business"
        actions={
          <Button variant="secondary">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        }
      />

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Profit — Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialsAreaChart data={monthlyFinancials} height={320} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientGrowthChart data={clientGrowth.map(d => ({ label: d.label, clients: d.value }))} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Budget Report</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={projectColumns} data={projects} rowKey={(p) => p.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadConversionChart data={leadConversion} height={300} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/12 text-electric">
            <FileBarChart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Need a custom report?</p>
            <p className="text-xs text-ink-faint">Build saved report templates once business logic is connected.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
