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
      email: "contact@acme.com",
      phone: "+1 (555) 123-4567",
      avatarSeed: "acme",
      status: "active",
      totalValue: 125000,
      projectsCount: 3,
      joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "San Francisco, CA",
      tags: ["Enterprise", "Tech"],
    },
    {
      id: generateId(),
      name: "Globex Inc",
      company: "Globex",
      email: "hello@globex.com",
      phone: "+1 (555) 987-6543",
      avatarSeed: "globex",
      status: "active",
      totalValue: 85000,
      projectsCount: 2,
      joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "New York, NY",
      tags: ["Finance", "Retainer"],
    },
    {
      id: generateId(),
      name: "Initech",
      company: "Initech LLC",
      email: "support@initech.com",
      phone: "+1 (555) 456-7890",
      avatarSeed: "initech",
      status: "pending",
      totalValue: 0,
      projectsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      location: "Austin, TX",
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
      budget: 50000,
      spent: 32000,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      team: ["Hatim", "Sarah Chen"],
      priority: "high"
    },
    {
      id: generateId(),
      name: "Globex App Development",
      client: "Globex Inc",
      status: "in-progress",
      progress: 30,
      budget: 85000,
      spent: 25000,
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
      amount: 15000,
      status: "pending",
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: 3
    },
    {
      id: generateId(),
      invoiceNumber: "INV-2026-002",
      client: "Globex Inc",
      amount: 25000,
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
      message: "Received payment of $25,000 from Globex Inc.",
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
      message: "New client Initech LLC joined.",
      actor: "Hatim",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  console.log("Inserting Activities...");
  await supabase.from("activities").upsert(activities);

  console.log("✅ Seeding complete!");
};

seedData().catch(console.error);
