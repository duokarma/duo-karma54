import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "violet" | "cyan" | "outline" }> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "outline" },
  pending: { label: "Pending", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
  draft: { label: "Draft", variant: "outline" },
  paid: { label: "Paid", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "danger" },
  "in-progress": { label: "In Progress", variant: "info" },
  "on-hold": { label: "On Hold", variant: "warning" },
  qualified: { label: "Qualified", variant: "cyan" },
  new: { label: "New", variant: "violet" },
  proposal: { label: "Proposal", variant: "info" },
  negotiation: { label: "Negotiation", variant: "warning" },
  todo: { label: "To Do", variant: "outline" },
  review: { label: "In Review", variant: "violet" },
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "info" },
  high: { label: "High", variant: "warning" },
  urgent: { label: "Urgent", variant: "danger" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? { label: status, variant: "default" as const };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
