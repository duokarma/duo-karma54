import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  TrendingUp,
  Wallet,
  PieChart,
  FileText,
  CheckSquare,
  Calendar,
  FolderOpen,
  BarChart3,
  LineChart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, group: "Overview" },
  { label: "Clients", path: "/admin/clients", icon: Users, group: "Pipeline" },
  { label: "Leads", path: "/admin/leads", icon: Target, group: "Pipeline" },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban, group: "Pipeline" },
  { label: "Revenue", path: "/admin/revenue", icon: TrendingUp, group: "Finance" },
  { label: "Expenses", path: "/admin/expenses", icon: Wallet, group: "Finance" },
  { label: "Profit", path: "/admin/profit", icon: PieChart, group: "Finance" },
  { label: "Invoices", path: "/admin/invoices", icon: FileText, group: "Finance" },
  { label: "Tasks", path: "/admin/tasks", icon: CheckSquare, group: "Workspace" },
  { label: "Calendar", path: "/admin/calendar", icon: Calendar, group: "Workspace" },
  { label: "Documents", path: "/admin/documents", icon: FolderOpen, group: "Workspace" },
  { label: "Reports", path: "/admin/reports", icon: BarChart3, group: "Insights" },
  { label: "Analytics", path: "/admin/analytics", icon: LineChart, group: "Insights" },
];

export const navGroups = ["Overview", "Pipeline", "Finance", "Workspace", "Insights"];
