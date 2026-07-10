export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "overdue"
  | "draft"
  | "paid"
  | "cancelled"
  | "won"
  | "lost"
  | "in-progress"
  | "on-hold"
  | "qualified"
  | "new";

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatarSeed: string;
  status: Status;
  totalValue: number;
  projectsCount: number;
  joinedDate: string;
  location: string;
  tags: string[];
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  value: number;
  stage: "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  probability: number;
  assignedTo: string;
  createdDate: string;
  lastContact: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "in-progress" | "completed" | "on-hold" | "pending";
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  team: string[];
  priority: "low" | "medium" | "high" | "urgent";
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  issueDate: string;
  dueDate: string;
  items: number;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "completed";
  dueDate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarSeed: string;
  email: string;
}

export interface Activity {
  id: string;
  type: "invoice" | "client" | "project" | "task" | "payment" | "lead";
  message: string;
  actor: string;
  timestamp: string;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "image" | "other";
  size: string;
  modifiedDate: string;
  folder: string;
  sharedWith: number;
}

export interface ChartPoint {
  id: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  orderIndex: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface MetricPoint {
  id: string;
  label: string;
  value: number;
  orderIndex: number;
}

export interface ExpenseBreakdownPoint {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: string;
}
