import type { Activity, ChartPoint, Document, TeamMember } from "@/types";

export const monthlyFinancials: ChartPoint[] = [
  { label: "Jul", revenue: 820000,  expenses: 510000, profit: 310000 },
  { label: "Aug", revenue: 940000,  expenses: 580000, profit: 360000 },
  { label: "Sep", revenue: 870000,  expenses: 530000, profit: 340000 },
  { label: "Oct", revenue: 1080000, expenses: 640000, profit: 440000 },
  { label: "Nov", revenue: 1150000, expenses: 690000, profit: 460000 },
  { label: "Dec", revenue: 1320000, expenses: 750000, profit: 570000 },
  { label: "Jan", revenue: 980000,  expenses: 600000, profit: 380000 },
  { label: "Feb", revenue: 1040000, expenses: 620000, profit: 420000 },
  { label: "Mar", revenue: 1180000, expenses: 670000, profit: 510000 },
  { label: "Apr", revenue: 1250000, expenses: 710000, profit: 540000 },
  { label: "May", revenue: 1090000, expenses: 650000, profit: 440000 },
  { label: "Jun", revenue: 1245000, expenses: 720000, profit: 525000 },
];

export const clientGrowth = [
  { label: "Jul", value: 48 },
  { label: "Aug", value: 52 },
  { label: "Sep", value: 51 },
  { label: "Oct", value: 55 },
  { label: "Nov", value: 57 },
  { label: "Dec", value: 59 },
  { label: "Jan", value: 58 },
  { label: "Feb", value: 60 },
  { label: "Mar", value: 61 },
  { label: "Apr", value: 62 },
  { label: "May", value: 63 },
  { label: "Jun", value: 64 },
];

export const leadConversion = [
  { label: "Jul", value: 38 },
  { label: "Aug", value: 42 },
  { label: "Sep", value: 39 },
  { label: "Oct", value: 44 },
  { label: "Nov", value: 46 },
  { label: "Dec", value: 51 },
  { label: "Jan", value: 47 },
  { label: "Feb", value: 49 },
  { label: "Mar", value: 52 },
  { label: "Apr", value: 54 },
  { label: "May", value: 50 },
  { label: "Jun", value: 53 },
];

export const expenseBreakdown: { label: string; value: number; color: string }[] = [
  { label: "Salaries",      value: 380000, color: "#2563EB" },
  { label: "Infrastructure",value: 110000, color: "#10B981" },
  { label: "Marketing",     value: 95000,  color: "#F59E0B" },
  { label: "Tools & SaaS",  value: 72000,  color: "#6366F1" },
  { label: "Legal & Admin", value: 38000,  color: "#EF4444" },
  { label: "Other",         value: 25000,  color: "#475569" },
];

export const team: TeamMember[] = [
  { id: "1", name: "Hatim K.",    role: "CEO & Founder",    avatarSeed: "hatim",   email: "admin@duokarrma.com" },
  { id: "2", name: "Aisha M.",    role: "Lead Designer",    avatarSeed: "aisha",   email: "aisha@duokarrma.com" },
  { id: "3", name: "Dev R.",      role: "Full-Stack Dev",   avatarSeed: "devraj",  email: "dev@duokarrma.com" },
  { id: "4", name: "Priya S.",    role: "Project Manager",  avatarSeed: "priya",   email: "priya@duokarrma.com" },
  { id: "5", name: "Omar F.",     role: "Client Success",   avatarSeed: "omar",    email: "omar@duokarrma.com" },
];

export const activities: Activity[] = [
  {
    id: "1",
    type: "payment",
    message: "Invoice #INV-0041 paid — ₹52,000",
    actor: "MJ Culture",
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: "2",
    type: "client",
    message: "New client onboarded — ABC Industries",
    actor: "Priya S.",
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    id: "3",
    type: "project",
    message: "Project milestone reached — Brand Identity v2",
    actor: "Aisha M.",
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
  {
    id: "4",
    type: "invoice",
    message: "Invoice #INV-0042 sent — ₹1,20,000",
    actor: "Dev R.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "5",
    type: "lead",
    message: "Lead qualified — Nexus Media Group",
    actor: "Omar F.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "6",
    type: "task",
    message: "Task completed — Q2 Financial Report",
    actor: "Hatim K.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "7",
    type: "project",
    message: "New project created — E-commerce Redesign",
    actor: "Priya S.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
  },
  {
    id: "8",
    type: "payment",
    message: "Invoice #INV-0039 paid — ₹84,500",
    actor: "GlobalTech Solutions",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
  },
];

export const invoiceStatusBreakdown = [
  { label: "Paid",    value: 28, color: "#10B981" },
  { label: "Pending", value: 11, color: "#F59E0B" },
  { label: "Overdue", value:  3, color: "#EF4444" },
  { label: "Draft",   value:  6, color: "#475569" },
];

export const documents: Document[] = [
  { id: "1", name: "Q2 2026 Financial Report.pdf",  type: "pdf",   size: "2.4 MB", modifiedDate: "2026-06-25", folder: "Finance",   sharedWith: 3 },
  { id: "2", name: "Brand Identity Guidelines.pdf", type: "pdf",   size: "8.1 MB", modifiedDate: "2026-06-20", folder: "Design",    sharedWith: 5 },
  { id: "3", name: "Client Proposal — Nexus.docx",  type: "doc",   size: "320 KB", modifiedDate: "2026-06-28", folder: "Proposals", sharedWith: 2 },
  { id: "4", name: "Revenue Dashboard Jun.xlsx",    type: "xls",   size: "540 KB", modifiedDate: "2026-06-27", folder: "Finance",   sharedWith: 2 },
  { id: "5", name: "Sprint Planning Board.doc",     type: "doc",   size: "180 KB", modifiedDate: "2026-06-26", folder: "Projects",  sharedWith: 4 },
];
