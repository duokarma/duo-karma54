import {
  LayoutDashboard,
  Target,
  FolderKanban,
  Wallet,
  CheckSquare,
  Calendar,
  FolderOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard",      path: "/admin",                icon: LayoutDashboard, group: "Overview" },
  { label: "Pipeline",       path: "/admin/pipeline",       icon: Target,          group: "Business" },
  { label: "Projects",       path: "/admin/projects",       icon: FolderKanban,    group: "Business" },
  { label: "Finance",        path: "/admin/finance",        icon: Wallet,          group: "Business" },
  { label: "Tasks",          path: "/admin/tasks",          icon: CheckSquare,     group: "Workspace" },
  { label: "Calendar",       path: "/admin/calendar",       icon: Calendar,        group: "Workspace" },
  { label: "Documents",      path: "/admin/documents",      icon: FolderOpen,      group: "Workspace" },
  { label: "Schema Builder", path: "/admin/schema-builder", icon: Sparkles,        group: "Custom" },
];

export const navGroups = ["Overview", "Business", "Workspace", "Custom"];
