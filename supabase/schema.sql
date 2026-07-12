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
  phone TEXT,
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  value NUMERIC NOT NULL,
  stage TEXT NOT NULL,
  probability INTEGER NOT NULL,
  "assignedTo" TEXT NOT NULL,
  "createdDate" DATE NOT NULL,
  "lastContact" DATE NOT NULL,
  phone TEXT,
  "businessType" TEXT,
  branches TEXT,
  "interestedIn" TEXT,
  challenge TEXT,
  timeline TEXT,
  "leadScore" INTEGER
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
  items INTEGER NOT NULL,
  "lineItems" JSONB DEFAULT '[]'::jsonb,
  "taxRate" NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  notes TEXT DEFAULT ''
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

-- Portfolio Items Table
CREATE TABLE portfolio_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  link TEXT
);

-- Financial Metrics View
CREATE OR REPLACE VIEW financial_metrics AS
WITH months AS (
    SELECT DISTINCT date_trunc('month', "issueDate") as month_date FROM invoices
    UNION
    SELECT DISTINCT date_trunc('month', date) as month_date FROM expenses
),
monthly_revenue AS (
    SELECT date_trunc('month', "issueDate") as month_date, SUM(amount) as revenue
    FROM invoices
    GROUP BY 1
),
monthly_expenses AS (
    SELECT date_trunc('month', date) as month_date, SUM(amount) as expenses
    FROM expenses
    GROUP BY 1
)
SELECT 
    EXTRACT(EPOCH FROM m.month_date)::TEXT as id,
    TO_CHAR(m.month_date, 'Mon') as label,
    COALESCE(r.revenue, 0) as revenue,
    COALESCE(e.expenses, 0) as expenses,
    COALESCE(r.revenue, 0) - COALESCE(e.expenses, 0) as profit,
    EXTRACT(MONTH FROM m.month_date)::INTEGER as "orderIndex"
FROM months m
LEFT JOIN monthly_revenue r ON m.month_date = r.month_date
LEFT JOIN monthly_expenses e ON m.month_date = e.month_date;

-- Client Growth View
CREATE OR REPLACE VIEW client_growth AS
WITH monthly_clients AS (
    SELECT date_trunc('month', "joinedDate") as month_date, COUNT(*) as new_clients
    FROM clients
    GROUP BY 1
)
SELECT 
    EXTRACT(EPOCH FROM month_date)::TEXT as id,
    TO_CHAR(month_date, 'Mon') as label,
    SUM(new_clients) OVER (ORDER BY month_date)::INTEGER as value,
    EXTRACT(MONTH FROM month_date)::INTEGER as "orderIndex"
FROM monthly_clients;

-- Lead Conversion View
CREATE OR REPLACE VIEW lead_conversion AS
SELECT 
  stage as id,
  stage as label, 
  COUNT(*)::INTEGER as value,
  CASE stage 
    WHEN 'new' THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'proposal' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'won' THEN 5
    WHEN 'lost' THEN 6
    ELSE 7
  END as "orderIndex"
FROM leads
GROUP BY stage;

-- Expense Breakdown View
CREATE OR REPLACE VIEW expense_breakdown AS
SELECT 
  category as id,
  category as label, 
  SUM(amount) as value, 
  'bg-electric' as color
FROM expenses
GROUP BY category;

-- Set up Row Level Security (RLS) to allow anon key to read/write for this demo
-- Note: In a production app, you should restrict this to authenticated users.

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on clients" ON clients;
CREATE POLICY "Allow anon read access on clients" ON clients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on clients" ON clients;
CREATE POLICY "Allow anon insert access on clients" ON clients FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on clients" ON clients;
CREATE POLICY "Allow anon update access on clients" ON clients FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on clients" ON clients;
CREATE POLICY "Allow anon delete access on clients" ON clients FOR DELETE USING (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on leads" ON leads;
CREATE POLICY "Allow anon read access on leads" ON leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on leads" ON leads;
CREATE POLICY "Allow anon insert access on leads" ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on leads" ON leads;
CREATE POLICY "Allow anon update access on leads" ON leads FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on leads" ON leads;
CREATE POLICY "Allow anon delete access on leads" ON leads FOR DELETE USING (true);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on projects" ON projects;
CREATE POLICY "Allow anon read access on projects" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on projects" ON projects;
CREATE POLICY "Allow anon insert access on projects" ON projects FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on projects" ON projects;
CREATE POLICY "Allow anon update access on projects" ON projects FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on projects" ON projects;
CREATE POLICY "Allow anon delete access on projects" ON projects FOR DELETE USING (true);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on invoices" ON invoices;
CREATE POLICY "Allow anon read access on invoices" ON invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on invoices" ON invoices;
CREATE POLICY "Allow anon insert access on invoices" ON invoices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on invoices" ON invoices;
CREATE POLICY "Allow anon update access on invoices" ON invoices FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on invoices" ON invoices;
CREATE POLICY "Allow anon delete access on invoices" ON invoices FOR DELETE USING (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on tasks" ON tasks;
CREATE POLICY "Allow anon read access on tasks" ON tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on tasks" ON tasks;
CREATE POLICY "Allow anon insert access on tasks" ON tasks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on tasks" ON tasks;
CREATE POLICY "Allow anon update access on tasks" ON tasks FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on tasks" ON tasks;
CREATE POLICY "Allow anon delete access on tasks" ON tasks FOR DELETE USING (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on team_members" ON team_members;
CREATE POLICY "Allow anon read access on team_members" ON team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on team_members" ON team_members;
CREATE POLICY "Allow anon insert access on team_members" ON team_members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on team_members" ON team_members;
CREATE POLICY "Allow anon update access on team_members" ON team_members FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on team_members" ON team_members;
CREATE POLICY "Allow anon delete access on team_members" ON team_members FOR DELETE USING (true);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on activities" ON activities;
CREATE POLICY "Allow anon read access on activities" ON activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on activities" ON activities;
CREATE POLICY "Allow anon insert access on activities" ON activities FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on activities" ON activities;
CREATE POLICY "Allow anon update access on activities" ON activities FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on activities" ON activities;
CREATE POLICY "Allow anon delete access on activities" ON activities FOR DELETE USING (true);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on documents" ON documents;
CREATE POLICY "Allow anon read access on documents" ON documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on documents" ON documents;
CREATE POLICY "Allow anon insert access on documents" ON documents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on documents" ON documents;
CREATE POLICY "Allow anon update access on documents" ON documents FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on documents" ON documents;
CREATE POLICY "Allow anon delete access on documents" ON documents FOR DELETE USING (true);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on expenses" ON expenses;
CREATE POLICY "Allow anon read access on expenses" ON expenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on expenses" ON expenses;
CREATE POLICY "Allow anon insert access on expenses" ON expenses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on expenses" ON expenses;
CREATE POLICY "Allow anon update access on expenses" ON expenses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on expenses" ON expenses;
CREATE POLICY "Allow anon delete access on expenses" ON expenses FOR DELETE USING (true);

ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on financial_metrics" ON financial_metrics;
CREATE POLICY "Allow anon read access on financial_metrics" ON financial_metrics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on financial_metrics" ON financial_metrics;
CREATE POLICY "Allow anon insert access on financial_metrics" ON financial_metrics FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on financial_metrics" ON financial_metrics;
CREATE POLICY "Allow anon update access on financial_metrics" ON financial_metrics FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on financial_metrics" ON financial_metrics;
CREATE POLICY "Allow anon delete access on financial_metrics" ON financial_metrics FOR DELETE USING (true);

ALTER TABLE client_growth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on client_growth" ON client_growth;
CREATE POLICY "Allow anon read access on client_growth" ON client_growth FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on client_growth" ON client_growth;
CREATE POLICY "Allow anon insert access on client_growth" ON client_growth FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on client_growth" ON client_growth;
CREATE POLICY "Allow anon update access on client_growth" ON client_growth FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on client_growth" ON client_growth;
CREATE POLICY "Allow anon delete access on client_growth" ON client_growth FOR DELETE USING (true);

ALTER TABLE lead_conversion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on lead_conversion" ON lead_conversion;
CREATE POLICY "Allow anon read access on lead_conversion" ON lead_conversion FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on lead_conversion" ON lead_conversion;
CREATE POLICY "Allow anon insert access on lead_conversion" ON lead_conversion FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on lead_conversion" ON lead_conversion;
CREATE POLICY "Allow anon update access on lead_conversion" ON lead_conversion FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on lead_conversion" ON lead_conversion;
CREATE POLICY "Allow anon delete access on lead_conversion" ON lead_conversion FOR DELETE USING (true);

ALTER TABLE expense_breakdown ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on expense_breakdown" ON expense_breakdown;
CREATE POLICY "Allow anon read access on expense_breakdown" ON expense_breakdown FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on expense_breakdown" ON expense_breakdown;
CREATE POLICY "Allow anon insert access on expense_breakdown" ON expense_breakdown FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on expense_breakdown" ON expense_breakdown;
CREATE POLICY "Allow anon update access on expense_breakdown" ON expense_breakdown FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on expense_breakdown" ON expense_breakdown;
CREATE POLICY "Allow anon delete access on expense_breakdown" ON expense_breakdown FOR DELETE USING (true);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on portfolio_items" ON portfolio_items;
CREATE POLICY "Allow anon read access on portfolio_items" ON portfolio_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on portfolio_items" ON portfolio_items;
CREATE POLICY "Allow anon insert access on portfolio_items" ON portfolio_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on portfolio_items" ON portfolio_items;
CREATE POLICY "Allow anon update access on portfolio_items" ON portfolio_items FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on portfolio_items" ON portfolio_items;
CREATE POLICY "Allow anon delete access on portfolio_items" ON portfolio_items FOR DELETE USING (true);

-- ============================================================
-- Website Inquiries — from landing page conversation flow
-- ============================================================
CREATE TABLE IF NOT EXISTS website_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  branches TEXT NOT NULL,
  interested_in TEXT NOT NULL,
  challenge TEXT,
  timeline TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website_chat',
  status TEXT NOT NULL DEFAULT 'new',
  lead_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE website_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access on website_inquiries" ON website_inquiries;
CREATE POLICY "Allow anon read access on website_inquiries" ON website_inquiries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert access on website_inquiries" ON website_inquiries;
CREATE POLICY "Allow anon insert access on website_inquiries" ON website_inquiries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update access on website_inquiries" ON website_inquiries;
CREATE POLICY "Allow anon update access on website_inquiries" ON website_inquiries FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete access on website_inquiries" ON website_inquiries;
CREATE POLICY "Allow anon delete access on website_inquiries" ON website_inquiries FOR DELETE USING (true);
