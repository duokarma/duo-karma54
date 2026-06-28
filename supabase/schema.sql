-- Drop existing tables if they exist (optional, for clean slate)
-- DROP TABLE IF EXISTS clients, leads, projects, invoices, tasks, team_members, activities, documents CASCADE;

-- Clients Table
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  "avatarSeed" TEXT NOT NULL,
  status TEXT NOT NULL,
  "totalValue" NUMERIC NOT NULL,
  "projectsCount" INTEGER NOT NULL,
  "joinedDate" DATE NOT NULL,
  location TEXT NOT NULL,
  tags TEXT[] NOT NULL
);

-- Leads Table
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  value NUMERIC NOT NULL,
  stage TEXT NOT NULL,
  probability INTEGER NOT NULL,
  "assignedTo" TEXT NOT NULL,
  "createdDate" DATE NOT NULL,
  "lastContact" DATE NOT NULL
);

-- Projects Table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL,
  budget NUMERIC NOT NULL,
  spent NUMERIC NOT NULL,
  "startDate" DATE NOT NULL,
  "dueDate" DATE NOT NULL,
  team TEXT[] NOT NULL,
  priority TEXT NOT NULL
);

-- Invoices Table
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  "invoiceNumber" TEXT NOT NULL,
  client TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  "issueDate" DATE NOT NULL,
  "dueDate" DATE NOT NULL,
  items INTEGER NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project TEXT NOT NULL,
  assignee TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  "dueDate" DATE NOT NULL
);

-- Team Members Table
CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "avatarSeed" TEXT NOT NULL,
  email TEXT NOT NULL
);

-- Activities Table
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  actor TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

-- Documents Table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  "modifiedDate" DATE NOT NULL,
  folder TEXT NOT NULL,
  "sharedWith" INTEGER NOT NULL
);

-- Expenses Table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL
);

-- Financial Metrics (Chart Data)
CREATE TABLE financial_metrics (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  revenue NUMERIC NOT NULL,
  expenses NUMERIC NOT NULL,
  profit NUMERIC NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

-- Client Growth (Chart Data)
CREATE TABLE client_growth (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

-- Lead Conversion (Chart Data)
CREATE TABLE lead_conversion (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  "orderIndex" INTEGER NOT NULL
);

-- Expense Breakdown (Chart Data)
CREATE TABLE expense_breakdown (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,
  color TEXT NOT NULL
);

-- Set up Row Level Security (RLS) to allow anon key to read/write for this demo
-- Note: In a production app, you should restrict this to authenticated users.

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on clients" ON clients FOR DELETE USING (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on leads" ON leads FOR DELETE USING (true);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on projects" ON projects FOR DELETE USING (true);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on invoices" ON invoices FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on invoices" ON invoices FOR DELETE USING (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on tasks" ON tasks FOR DELETE USING (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on team_members" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on team_members" ON team_members FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on team_members" ON team_members FOR DELETE USING (true);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on activities" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on activities" ON activities FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on activities" ON activities FOR DELETE USING (true);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on documents" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on documents" ON documents FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on documents" ON documents FOR DELETE USING (true);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on expenses" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on expenses" ON expenses FOR DELETE USING (true);

ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on financial_metrics" ON financial_metrics FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on financial_metrics" ON financial_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on financial_metrics" ON financial_metrics FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on financial_metrics" ON financial_metrics FOR DELETE USING (true);

ALTER TABLE client_growth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on client_growth" ON client_growth FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on client_growth" ON client_growth FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on client_growth" ON client_growth FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on client_growth" ON client_growth FOR DELETE USING (true);

ALTER TABLE lead_conversion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on lead_conversion" ON lead_conversion FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on lead_conversion" ON lead_conversion FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on lead_conversion" ON lead_conversion FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on lead_conversion" ON lead_conversion FOR DELETE USING (true);

ALTER TABLE expense_breakdown ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on expense_breakdown" ON expense_breakdown FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access on expense_breakdown" ON expense_breakdown FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access on expense_breakdown" ON expense_breakdown FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access on expense_breakdown" ON expense_breakdown FOR DELETE USING (true);
