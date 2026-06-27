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
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, group: "Overview" },
  { label: "Clients", path: "/clients", icon: Users, group: "Pipeline" },
  { label: "Leads", path: "/leads", icon: Target, group: "Pipeline" },
  { label: "Projects", path: "/projects", icon: FolderKanban, group: "Pipeline" },
  { label: "Revenue", path: "/revenue", icon: TrendingUp, group: "Finance" },
  { label: "Expenses", path: "/expenses", icon: Wallet, group: "Finance" },
  { label: "Profit", path: "/profit", icon: PieChart, group: "Finance" },
  { label: "Invoices", path: "/invoices", icon: FileText, group: "Finance" },
  { label: "Tasks", path: "/tasks", icon: CheckSquare, group: "Workspace" },
  { label: "Calendar", path: "/calendar", icon: Calendar, group: "Workspace" },
  { label: "Documents", path: "/documents", icon: FolderOpen, group: "Workspace" },
  { label: "Reports", path: "/reports", icon: BarChart3, group: "Insights" },
  { label: "Analytics", path: "/analytics", icon: LineChart, group: "Insights" },
  { label: "Settings", path: "/settings", icon: Settings, group: "System" },
];

export const navGroups = ["Overview", "Pipeline", "Finance", "Workspace", "Insights", "System"];
