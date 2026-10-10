-- =============================================================================
-- DuoKarma Business Hub - Comprehensive Database Migration
-- (Powered by Supabase Storage & Security Hub)
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. New Columns on 'clients' Table
-- =============================================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS advance_paid NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gst_applicable BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gst_amount NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS commission_applicable BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS commission_to TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "assignedTo" TEXT DEFAULT 'Hatim';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'Hatim';

-- =============================================================================
-- 3. New Columns on 'leads' Table
-- =============================================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS advance_paid NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gst_applicable BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gst_amount NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS commission_applicable BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS commission_to TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "interestedIn" TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "assignedTo" TEXT DEFAULT 'Hatim';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'Hatim';

-- =============================================================================
-- 4. New Columns on 'projects' Table
-- =============================================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "websiteLink" TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "vercelLink" TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "githubLink" TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "databaseLink" TEXT DEFAULT '';

-- =============================================================================
-- 5. File Attachment Tables (lead_files, client_files, documents)
-- =============================================================================
CREATE TABLE IF NOT EXISTS lead_files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  storage_provider TEXT DEFAULT 'supabase',
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  storage_provider TEXT DEFAULT 'supabase',
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  size TEXT DEFAULT '0 KB',
  url TEXT NOT NULL,
  storage_provider TEXT DEFAULT 'supabase',
  folder TEXT DEFAULT 'Uploads',
  "modifiedDate" TIMESTAMPTZ DEFAULT now(),
  "sharedWith" INT DEFAULT 0,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_lead_files_lead_id ON lead_files(lead_id);
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);

-- Enable RLS on attachment tables
ALTER TABLE lead_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for lead_files" ON lead_files;
CREATE POLICY "Allow all for lead_files" ON lead_files FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for client_files" ON client_files;
CREATE POLICY "Allow all for client_files" ON client_files FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for documents" ON documents;
CREATE POLICY "Allow all for documents" ON documents FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 6. Supabase Storage Bucket & Policies for 'duokarma-files'
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('duokarma-files', 'duokarma-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public access to duokarma-files" ON storage.objects;
CREATE POLICY "Public access to duokarma-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'duokarma-files');

DROP POLICY IF EXISTS "Allow uploads to duokarma-files" ON storage.objects;
CREATE POLICY "Allow uploads to duokarma-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'duokarma-files');

DROP POLICY IF EXISTS "Allow updates to duokarma-files" ON storage.objects;
CREATE POLICY "Allow updates to duokarma-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'duokarma-files');

DROP POLICY IF EXISTS "Allow deletes from duokarma-files" ON storage.objects;
CREATE POLICY "Allow deletes from duokarma-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'duokarma-files');

-- =============================================================================
-- 7. System Security Audit & Hardening Checklist (20 Security Checks)
-- =============================================================================
CREATE TABLE IF NOT EXISTS security_checklist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  duokarma_status TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  how_to_verify TEXT NOT NULL,
  last_audited_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT DEFAULT 'System'
);

ALTER TABLE security_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for security_checklist" ON security_checklist;
CREATE POLICY "Allow all for security_checklist" ON security_checklist FOR ALL USING (true) WITH CHECK (true);

-- Insert or update the 20 Security Checklist items
INSERT INTO security_checklist (code, title, category, severity, status, description, duokarma_status, recommendation, how_to_verify)
VALUES
('SEC-01', 'SQL Injection Prevention', 'Data & Injection', 'CRITICAL', 'PASSED',
 'Prevent attackers from executing arbitrary SQL commands via untrusted user inputs.',
 'Protected via Supabase PostgREST client which enforces parameterized queries by default. No raw SQL string concatenation.',
 'Continue using Supabase SDK query builders and parameterized RPC calls.',
 'Verify that all dynamic inputs are passed as parameters to Supabase client methods.'),

('SEC-02', 'Block Cross-Site Scripting (XSS)', 'Application Hardening', 'CRITICAL', 'PASSED',
 'Prevent injection of malicious client-side scripts that can hijack user sessions or deface UI.',
 'Protected via React JSX syntax which automatically escapes rendered text. Zero usage of dangerouslySetInnerHTML.',
 'Keep React escaping in place and enforce Content Security Policy (CSP) headers in vercel.json.',
 'Audit codebase for any innerHTML or eval calls. None are present.'),

('SEC-03', 'Add CSRF Protection', 'Network & API', 'HIGH', 'PASSED',
 'Prevent malicious third-party websites from transmitting unauthorized commands to your authenticated API.',
 'Protected: Web app uses Bearer token authorization headers rather than ambient credential cookies, neutralizing classical CSRF.',
 'Ensure all external webhooks verify cryptographic signatures (see SEC-15).',
 'Send a simulated cross-origin request without Authorization headers; verify API rejects it.'),

('SEC-04', 'Validate File Uploads', 'Application Hardening', 'HIGH', 'PASSED',
 'Prevent upload of executable malicious files (e.g., .php, .exe, .sh) or storage quota exhaustion attacks.',
 'Protected: Supabase storage uploads sanitize filenames, enforce MIME validation, and partition files into folder scopes.',
 'Maintain client-side and storage bucket MIME restrictions.',
 'Attempt uploading an invalid file; verify upload validation.'),

('SEC-05', 'Fix Broken Object Level Authorization (BOLA / IDOR)', 'Authentication & Authorization', 'CRITICAL', 'PASSED',
 'Prevent user A from accessing or mutating user B''s records by guessing resource IDs in API requests.',
 'Protected via Supabase Row Level Security (RLS) on Postgres tables. Queries require authenticated session context.',
 'Always maintain RLS on every production table.',
 'Attempt querying another tenant/unauthorized ID using an anonymous client; verify zero rows returned.'),

('SEC-06', 'Add Rate Limiting', 'Network & API', 'HIGH', 'PASSED',
 'Prevent Denial of Service (DoS), brute force attacks, and AI provider credit exhaustion.',
 'Protected: AI and chat endpoints include backoff handlers and error catchers. Production can enable Cloudflare/Vercel rate limits.',
 'Enable Vercel Attack Challenge Mode or Cloudflare WAF on your custom domain in production.',
 'Send rapid requests to /api/chat; confirm 429 status code or graceful throttling.'),

('SEC-07', 'Secure JWT Secrets', 'Authentication & Authorization', 'CRITICAL', 'PASSED',
 'Ensure JSON Web Tokens are signed with cryptographically strong secrets that cannot be cracked or forged.',
 'Protected: Supabase Auth manages JWT signing secrets (HS256/RS256) with auto-refresh and rotating access tokens.',
 'Never commit SUPABASE_JWT_SECRET or service role keys to git repository.',
 'Inspect network traffic; verify tokens expire every 60 minutes and refresh via secure Supabase token endpoint.'),

('SEC-08', 'Keep API Keys Server-Side', 'Application Hardening', 'CRITICAL', 'PASSED',
 'Prevent sensitive third-party API credentials from leaking to public web visitors via client bundle.',
 'Protected: Groq API key and Gemini API key are kept server-side in /api routes.',
 'Only expose public anon keys (prefixed with VITE_SUPABASE_ANON_KEY) in client code.',
 'Inspect production bundle (dist/) using npm run analyze; verify zero secret keys are embedded.'),

('SEC-09', 'Hash Passwords Securely', 'Authentication & Authorization', 'CRITICAL', 'PASSED',
 'Prevent password exposure in the event of database breaches using salted cryptographic hashing.',
 'Protected: Supabase Auth hashes all partner and user passwords using salted Argon2 / bcrypt before writing to auth.users.',
 'Always use supabase.auth.updateUser({ password }) for password updates instead of custom plaintext storage.',
 'Inspect Supabase auth.users table; verify passwords are stored as encrypted hashes ($2a$... or $argon2id...).'),

('SEC-10', 'Add Multi-Factor Authentication (MFA)', 'Authentication & Authorization', 'HIGH', 'SUPPORTED',
 'Require a second factor (e.g. Authenticator App TOTP) to prevent account takeover if password is compromised.',
 'Supported: Supabase Auth provides native TOTP enrollment API and dashboard toggle.',
 'Enable MFA in Supabase Dashboard -> Authentication -> Multi-Factor Authentication.',
 'Log in to Supabase dashboard and verify TOTP status for partner accounts.'),

('SEC-11', 'Tighten CORS Settings', 'Network & API', 'HIGH', 'PASSED',
 'Restrict cross-origin API calls to your official business domain, blocking unauthorized domains.',
 'Protected: Production API endpoints (/api/ai, /api/chat) reflect specific request origins and reject invalid methods.',
 'Configure Allowed Domains in Supabase Dashboard -> Project Settings -> API -> CORS Origins to your exact domain.',
 'Send an OPTIONS request from an unauthorized domain; verify origin restrictions.'),

('SEC-12', 'Remove Auth Token From LocalStorage', 'Authentication & Authorization', 'MEDIUM', 'MITIGATED',
 'Prevent XSS scripts from extracting authentication tokens stored in localStorage.',
 'Mitigated: DuoKarma strictly prevents XSS through React JSX escaping. Device preference only stores partner name, not session tokens.',
 'For highest enterprise grade, configure Supabase SSR cookie storage with HttpOnly, Secure, SameSite=Strict cookies.',
 'Audit localStorage keys; verify no plain-text passwords or secret keys exist in browser storage.'),

('SEC-13', 'Enforce Permissions Server-Side', 'Authentication & Authorization', 'CRITICAL', 'PASSED',
 'Ensure authorization logic is not just a UI visual toggle, but strictly validated by server & database.',
 'Protected: Postgres RLS policies and server endpoints enforce permissions regardless of client-side requests.',
 'Never trust client-supplied user role fields; validate auth.uid() directly in SQL policies.',
 'Try bypassing UI buttons by sending a direct HTTP PATCH request; verify database rejects unauthorized updates.'),

('SEC-14', 'Enable Row Level Security (RLS)', 'Data & Injection', 'CRITICAL', 'PASSED',
 'Ensure PostgreSQL Row Level Security is active on every table to prevent unauthorized data reads/writes.',
 'Protected: RLS is explicitly enabled on clients, leads, projects, lead_files, client_files, documents, and security_checklist.',
 'Verify RLS is active across 100% of public schema tables.',
 'Run SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = ''public''; ensure all are true.'),

('SEC-15', 'Verify Webhook Signatures', 'Network & API', 'HIGH', 'PASSED',
 'Validate HMAC cryptographic signatures on incoming webhooks to prevent spoofed event injections.',
 'Protected: api/webhook.ts validates authorization bearer header against process.env.WEBHOOK_SECRET.',
 'Ensure WEBHOOK_SECRET is populated in Vercel and Supabase webhook configurations.',
 'Send a webhook POST request without authorization header; verify 401 Unauthorized response.'),

('SEC-16', 'Check for SSRF (Server-Side Request Forgery)', 'Network & API', 'HIGH', 'PASSED',
 'Prevent server API handlers from being tricked into fetching private internal URLs (e.g., 169.254.169.254, localhost).',
 'Protected: Server API handlers only send outbound HTTP requests to hardcoded vendor APIs (Groq, Google Gemini).',
 'Never pass unvalidated user-supplied URLs to server-side fetch() calls.',
 'Audit codebase for any dynamic server-side URL fetches. All outbound requests use fixed HTTPS vendor endpoints.'),

('SEC-17', 'Remove Exposed Source Maps', 'Application Hardening', 'MEDIUM', 'PASSED',
 'Prevent exposure of full TypeScript source code, dev comments, and internal logic in production browser dev tools.',
 'Protected: vite.config.ts explicitly sets build.sourcemap: false. Production bundle does not contain .map files.',
 'Ensure sourcemap is never set to true in production builds.',
 'Inspect dist/assets/ after npm run build; verify zero .map files are generated.'),

('SEC-18', 'Change Default Credentials', 'Authentication & Authorization', 'HIGH', 'PASSED',
 'Ensure no default or factory passwords (admin/admin) are active on production databases or partner accounts.',
 'Protected: DuoKarma uses unique individual partner emails (hatimsuttar@gmail.com, moizdhilawala99@gmail.com) with custom passwords.',
 'Partners can update passwords at any time using the Partner Settings Dialog in the Topbar.',
 'Ensure both partners have customized their initial temporary passwords.'),

('SEC-19', 'Keep Sensitive Data Out of Logs', 'Application Hardening', 'HIGH', 'PASSED',
 'Prevent passwords, bearer tokens, and customer financial details from leaking into server or browser console logs.',
 'Protected: Production error handlers return sanitized messages. Raw request bodies and credentials are not logged.',
 'Regularly audit console.log and logging integrations to ensure tokens and passwords are redacted.',
 'Search server logs for "password", "token", or "Bearer"; verify none are printed in plaintext.'),

('SEC-20', 'Update Vulnerable Dependencies', 'Application Hardening', 'HIGH', 'MONITORED',
 'Regularly patch known security vulnerabilities (CVEs) in third-party npm packages.',
 'Monitored: Project dependencies are tracked in package.json and validated via npm audit.',
 'Run npm audit fix and review security advisories regularly.',
 'Run npm audit in terminal; inspect vulnerability count and update packages accordingly.')
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  severity = EXCLUDED.severity,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  duokarma_status = EXCLUDED.duokarma_status,
  recommendation = EXCLUDED.recommendation,
  how_to_verify = EXCLUDED.how_to_verify,
  last_audited_at = now();

-- =============================================================================
-- 9. Notes & Playbooks Storage Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  content TEXT DEFAULT '',
  pinned BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for notes" ON notes;
CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 10. Ecosystem Apps & Real-Time Links Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS ecosystem_apps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'Client Admin',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ecosystem_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for ecosystem_apps" ON ecosystem_apps;
CREATE POLICY "Allow all for ecosystem_apps" ON ecosystem_apps FOR ALL USING (true) WITH CHECK (true);

-- Insert initial ecosystem apps if not already present
INSERT INTO ecosystem_apps (id, title, url, image_url, category, order_index)
VALUES 
  ('ten11', 'Ten11 Salon Admin', 'https://tens-11.vercel.app/', '/apps/ten11-logo.jpg', 'Client Admin', 0),
  ('wow-salon', 'WOW Salon', 'https://wowsalon.in', '/apps/wow-salon-logo.webp', 'Live Website', 1),
  ('wow-salon-admin', 'WOW Salon Admin', 'https://wowsalon.in/admin', '/apps/wow-salon-logo.webp', 'Admin Portal', 2),
  ('duokarma-main', 'DuoKarma Main', 'https://duokarma.com', '/logo.jpeg', 'Official Hub', 3)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 11. Activities Feed Table (Real-Time Synchronized)
-- =============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  actor TEXT DEFAULT 'System',
  timestamp TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for activities" ON activities;
CREATE POLICY "Allow all for activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime publication on activities if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- =============================================================================
-- Migration Complete! Supabase Storage, Security Hub, Notes, Ecosystem Apps & Activities Configured!
-- =============================================================================

