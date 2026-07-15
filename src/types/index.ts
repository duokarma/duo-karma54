export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "completed"
  | "overdue"
  | "draft"
  | "paid"
  | "partially_paid"
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
  incomeType?: "one-time" | "monthly" | "yearly";
  amountPaid?: number;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  source: string;
  value: number;
  stage: "new" | "negotiation" | "won" | "lost";
  probability: number;
  assignedTo: string;
  createdDate: string;
  lastContact: string;
  // Enriched fields from conversation flow (optional)
  businessType?: string;
  branches?: string;
  interestedIn?: string;
  challenge?: string;
  timeline?: string;
  leadScore?: number;
}

export interface WebsiteInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_type: string;
  branches: string;
  interested_in: string;
  challenge?: string;
  timeline: string;
  source: string;
  status: "new" | "contacted" | "converted";
  lead_score: number;
  created_at: string;
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

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft" | "partially_paid";
  issueDate: string;
  dueDate: string;
  items: number;
  lineItems?: InvoiceLineItem[];
  taxRate?: number;
  discount?: number;
  notes?: string;
  incomeType?: "one-time" | "monthly" | "yearly";
  amountPaid?: number;
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
  url?: string;
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
