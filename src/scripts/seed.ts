import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const generateId = () => Math.random().toString(36).substring(2, 9);

const seedData = async () => {
  console.log("Seeding database...");

  // Seed Team Members
  const teamMembers = [
    { id: generateId(), name: "Hatim", role: "Founder", avatarSeed: "hatim", email: "hatim@example.com" },
    { id: generateId(), name: "Sarah Chen", role: "Design Lead", avatarSeed: "sarah", email: "sarah@example.com" },
    { id: generateId(), name: "Mike Johnson", role: "Senior Developer", avatarSeed: "mike", email: "mike@example.com" },
    { id: generateId(), name: "Alex Kumar", role: "Project Manager", avatarSeed: "alex", email: "alex@example.com" },
  ];
  console.log("Inserting Team Members...");
  await supabase.from("team_members").upsert(teamMembers);

  // Seed Clients
  const clients = [
    {
      id: generateId(),
      name: "Acme Corp",
      company: "Acme Corporation",
      email: "contact@acme.in",
      phone: "+91 98765 43210",
      avatarSeed: "acme",
      status: "active",
      totalValue: 2500000,
      projectsCount: 3,
      joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Mumbai, MH",
      tags: ["Enterprise", "Tech"],
    },
    {
      id: generateId(),
      name: "Globex India",
      company: "Globex",
      email: "hello@globex.in",
      phone: "+91 87654 32109",
      avatarSeed: "globex",
      status: "active",
      totalValue: 1850000,
      projectsCount: 2,
      joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "Bengaluru, KA",
      tags: ["Finance", "Retainer"],
    },
    {
      id: generateId(),
      name: "Initech",
      company: "Initech Pvt Ltd",
      email: "support@initech.in",
      phone: "+91 76543 21098",
      avatarSeed: "initech",
      status: "pending",
      totalValue: 0,
      projectsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      location: "New Delhi, DL",
      tags: ["Startup"],
    }
  ];
  console.log("Inserting Clients...");
  await supabase.from("clients").upsert(clients);

  // Seed Projects
  const projects = [
    {
      id: generateId(),
      name: "Acme Rebranding",
      client: "Acme Corp",
      status: "in-progress",
      progress: 65,
      budget: 850000,
      spent: 532000,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      team: ["Hatim", "Sarah Chen"],
      priority: "high"
    },
    {
      id: generateId(),
      name: "Globex App Development",
      client: "Globex India",
      status: "in-progress",
      progress: 30,
      budget: 1500000,
      spent: 425000,
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      team: ["Hatim", "Mike Johnson"],
      priority: "urgent"
    }
  ];
  console.log("Inserting Projects...");
  await supabase.from("projects").upsert(projects);

  // Seed Tasks
  const tasks = [
    {
      id: generateId(),
      title: "Finalize Logo Concepts",
      project: "Acme Rebranding",
      assignee: "Sarah Chen",
      priority: "high",
      status: "in-progress",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: generateId(),
      title: "Setup DB Architecture",
      project: "Globex App Development",
      assignee: "Mike Johnson",
      priority: "urgent",
      status: "todo",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  ];
  console.log("Inserting Tasks...");
  await supabase.from("tasks").upsert(tasks);

  // Seed Invoices
  const invoices = [
    {
      id: generateId(),
      invoiceNumber: "INV-2026-001",
      client: "Acme Corp",
      amount: 450000,
      status: "pending",
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: 3
    },
    {
      id: generateId(),
      invoiceNumber: "INV-2026-002",
      client: "Globex India",
      amount: 850000,
      status: "paid",
      issueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: 5
    }
  ];
  console.log("Inserting Invoices...");
  await supabase.from("invoices").upsert(invoices);

  // Seed Activities (Feed)
  const activities = [
    {
      id: generateId(),
      type: "payment",
      message: "Received payment of ₹8,50,000 from Globex India.",
      actor: "System",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      type: "project",
      message: "Acme Rebranding reached 65% completion.",
      actor: "Sarah Chen",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      type: "client",
      message: "New client Initech Pvt Ltd joined.",
      actor: "Hatim",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  console.log("Inserting Activities...");
  await supabase.from("activities").upsert(activities);

  // Seed Expenses
  const expenses = [
    {
      id: generateId(),
      description: "AWS Hosting",
      category: "Software",
      amount: 45000,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: generateId(),
      description: "Office Rent",
      category: "Facilities",
      amount: 120000,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  ];
  console.log("Inserting Expenses...");
  await supabase.from("expenses").upsert(expenses);

  // Seed Leads
  const leads = [
    {
      id: generateId(),
      name: "Rahul Sharma",
      company: "Sharma Tech",
      email: "rahul@sharmatech.in",
      source: "Referral",
      value: 500000,
      stage: "proposal",
      probability: 70,
      assignedTo: "Hatim",
      createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: generateId(),
      name: "Priya Patel",
      company: "Patel Group",
      email: "priya@patelgroup.in",
      source: "Website",
      value: 1200000,
      stage: "negotiation",
      probability: 40,
      assignedTo: "Alex Kumar",
      createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  ];
  console.log("Inserting Leads...");
  await supabase.from("leads").upsert(leads);

  // Seed Documents
  const documents = [
    {
      id: generateId(),
      name: "Q3_Financial_Report.pdf",
      type: "pdf",
      size: "2.4 MB",
      modifiedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      folder: "Reports",
      sharedWith: 3
    },
    {
      id: generateId(),
      name: "Acme_Brand_Guidelines.pdf",
      type: "pdf",
      size: "8.1 MB",
      modifiedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      folder: "Client Assets",
      sharedWith: 5
    }
  ];
  console.log("Inserting Documents...");
  await supabase.from("documents").upsert(documents);

  // Seed Financial Metrics
  const financialMetrics = [
    { id: generateId(), label: "Jul", revenue: 820000, expenses: 510000, profit: 310000, orderIndex: 1 },
    { id: generateId(), label: "Aug", revenue: 940000, expenses: 580000, profit: 360000, orderIndex: 2 },
    { id: generateId(), label: "Sep", revenue: 870000, expenses: 530000, profit: 340000, orderIndex: 3 },
    { id: generateId(), label: "Oct", revenue: 1080000, expenses: 640000, profit: 440000, orderIndex: 4 },
    { id: generateId(), label: "Nov", revenue: 1150000, expenses: 690000, profit: 460000, orderIndex: 5 },
    { id: generateId(), label: "Dec", revenue: 1320000, expenses: 750000, profit: 570000, orderIndex: 6 },
    { id: generateId(), label: "Jan", revenue: 980000, expenses: 600000, profit: 380000, orderIndex: 7 },
    { id: generateId(), label: "Feb", revenue: 1040000, expenses: 620000, profit: 420000, orderIndex: 8 },
    { id: generateId(), label: "Mar", revenue: 1180000, expenses: 670000, profit: 510000, orderIndex: 9 },
    { id: generateId(), label: "Apr", revenue: 1250000, expenses: 710000, profit: 540000, orderIndex: 10 },
    { id: generateId(), label: "May", revenue: 1090000, expenses: 650000, profit: 440000, orderIndex: 11 },
    { id: generateId(), label: "Jun", revenue: 1245000, expenses: 720000, profit: 525000, orderIndex: 12 }
  ];
  console.log("Inserting Financial Metrics...");
  await supabase.from("financial_metrics").upsert(financialMetrics);

  const clientGrowth = [
    { id: generateId(), label: "Jul", value: 48, orderIndex: 1 },
    { id: generateId(), label: "Aug", value: 52, orderIndex: 2 },
    { id: generateId(), label: "Sep", value: 54, orderIndex: 3 },
    { id: generateId(), label: "Oct", value: 59, orderIndex: 4 },
    { id: generateId(), label: "Nov", value: 61, orderIndex: 5 },
    { id: generateId(), label: "Dec", value: 64, orderIndex: 6 },
  ];
  console.log("Inserting Client Growth...");
  await supabase.from("client_growth").upsert(clientGrowth);

  const leadConversion = [
    { id: generateId(), label: "Jul", value: 24, orderIndex: 1 },
    { id: generateId(), label: "Aug", value: 28, orderIndex: 2 },
    { id: generateId(), label: "Sep", value: 25, orderIndex: 3 },
    { id: generateId(), label: "Oct", value: 32, orderIndex: 4 },
    { id: generateId(), label: "Nov", value: 35, orderIndex: 5 },
    { id: generateId(), label: "Dec", value: 38, orderIndex: 6 },
  ];
  console.log("Inserting Lead Conversion...");
  await supabase.from("lead_conversion").upsert(leadConversion);

  const expenseBreakdown = [
    { id: generateId(), label: "Payroll", value: 420000, color: "#2563EB" },
    { id: generateId(), label: "Software", value: 85000, color: "#10B981" },
    { id: generateId(), label: "Marketing", value: 125000, color: "#F59E0B" },
    { id: generateId(), label: "Office", value: 90000, color: "#8B5CF6" },
  ];
  console.log("Inserting Expense Breakdown...");
  await supabase.from("expense_breakdown").upsert(expenseBreakdown);

  console.log("✅ Seeding complete!");
};

seedData().catch(console.error);
