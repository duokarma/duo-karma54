import type { Activity, ChartPoint, Document, TeamMember } from "@/types";

export const monthlyFinancials: ChartPoint[] = [
  { label: "Jan", revenue: 142000, expenses: 89000, profit: 53000 },
  { label: "Feb", revenue: 158000, expenses: 94000, profit: 64000 },
  { label: "Mar", revenue: 171000, expenses: 98000, profit: 73000 },
  { label: "Apr", revenue: 165000, expenses: 102000, profit: 63000 },
  { label: "May", revenue: 189000, expenses: 108000, profit: 81000 },
  { label: "Jun", revenue: 212000, expenses: 115000, profit: 97000 },
];

export const clientGrowth = [
  { label: "Jan", clients: 38 },
  { label: "Feb", clients: 42 },
  { label: "Mar", clients: 47 },
  { label: "Apr", clients: 51 },
  { label: "May", clients: 58 },
  { label: "Jun", clients: 64 },
];

export const leadConversion = [
  { label: "New", value: 24 },
  { label: "Qualified", value: 18 },
  { label: "Proposal", value: 11 },
  { label: "Negotiation", value: 7 },
  { label: "Won", value: 4 },
];

export const expenseBreakdown = [
  { label: "Payroll", value: 62000, color: "var(--color-electric)" },
  { label: "Software", value: 14500, color: "var(--color-violet)" },
  { label: "Marketing", value: 19800, color: "var(--color-cyan)" },
  { label: "Office", value: 8900, color: "var(--color-amber)" },
  { label: "Other", value: 9800, color: "var(--color-rose)" },
];

export const team: TeamMember[] = [
  { id: "tm-001", name: "Sarah Kim", role: "Engagement Director", avatarSeed: "Sarah Kim", email: "sarah.kim@duokarrma.com" },
  { id: "tm-002", name: "Marcus Webb", role: "Senior Designer", avatarSeed: "Marcus Webb", email: "marcus.webb@duokarrma.com" },
  { id: "tm-003", name: "Tariq Hassan", role: "Brand Strategist", avatarSeed: "Tariq Hassan", email: "tariq.hassan@duokarrma.com" },
  { id: "tm-004", name: "Elena Vance", role: "Product Engineer", avatarSeed: "Elena Vance", email: "elena.vance@duokarrma.com" },
];

export const activities: Activity[] = [
  { id: "ac-001", type: "payment", message: "Payment received from Helios Dynamics", actor: "System", timestamp: "2026-06-26T08:12:00" },
  { id: "ac-002", type: "project", message: "Kintsugi Robotics OS UI moved to 85% complete", actor: "Marcus Webb", timestamp: "2026-06-25T16:40:00" },
  { id: "ac-003", type: "lead", message: "New lead captured — Brightline Energy", actor: "Sarah Kim", timestamp: "2026-06-25T11:05:00" },
  { id: "ac-004", type: "invoice", message: "Invoice DK-10236 created as draft", actor: "Sarah Kim", timestamp: "2026-06-24T14:22:00" },
  { id: "ac-005", type: "client", message: "Lumen Health Group added 2 new contacts", actor: "Aisha Bello", timestamp: "2026-06-23T09:50:00" },
  { id: "ac-006", type: "task", message: "QA pass on Kintsugi control panel assigned", actor: "Elena Vance", timestamp: "2026-06-22T18:15:00" },
  { id: "ac-007", type: "payment", message: "Invoice DK-10233 marked overdue", actor: "System", timestamp: "2026-06-22T07:00:00" },
];

export const documents: Document[] = [
  { id: "dc-001", name: "Helios Brand Guidelines v3.pdf", type: "pdf", size: "8.2 MB", modifiedDate: "2026-06-20", folder: "Helios Dynamics", sharedWith: 4 },
  { id: "dc-002", name: "Northwind MSA — Signed.pdf", type: "pdf", size: "1.1 MB", modifiedDate: "2026-06-15", folder: "Northwind Capital", sharedWith: 2 },
  { id: "dc-003", name: "Q2 Revenue Summary.xls", type: "xls", size: "640 KB", modifiedDate: "2026-06-24", folder: "Internal", sharedWith: 5 },
  { id: "dc-004", name: "Verdant Packaging Mockups.doc", type: "doc", size: "3.4 MB", modifiedDate: "2026-03-18", folder: "Verdant Foods Co.", sharedWith: 3 },
  { id: "dc-005", name: "Kintsugi UI Kit — Final.image", type: "image", size: "22.8 MB", modifiedDate: "2026-06-19", folder: "Kintsugi Robotics", sharedWith: 6 },
  { id: "dc-006", name: "Hiring Plan H2 2026.doc", type: "doc", size: "420 KB", modifiedDate: "2026-06-12", folder: "Internal", sharedWith: 2 },
  { id: "dc-007", name: "Marbella Reservation Flow.pdf", type: "pdf", size: "2.6 MB", modifiedDate: "2026-06-21", folder: "Marbella Hospitality", sharedWith: 3 },
];
