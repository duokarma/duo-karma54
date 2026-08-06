-- ============================================================
-- Dynamic Schema Builder Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. dynamic_schemas — stores the "sections" you create (e.g. "Clients", "Inventory")
CREATE TABLE IF NOT EXISTS dynamic_schemas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT NOT NULL DEFAULT 'Database',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. dynamic_schema_fields — stores the columns/fields for each schema
CREATE TABLE IF NOT EXISTS dynamic_schema_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_id   UUID NOT NULL REFERENCES dynamic_schemas(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'date', 'select', 'email', 'url', 'textarea')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  options     JSONB,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (schema_id, slug)
);

-- 3. dynamic_records — stores the actual data as flexible JSON
CREATE TABLE IF NOT EXISTS dynamic_records (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_id  UUID NOT NULL REFERENCES dynamic_schemas(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dynamic_schema_fields_schema_id ON dynamic_schema_fields(schema_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_records_schema_id ON dynamic_records(schema_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_records_created_at ON dynamic_records(created_at DESC);

-- RLS
ALTER TABLE dynamic_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_schema_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access_dynamic_schemas"
  ON dynamic_schemas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access_dynamic_schema_fields"
  ON dynamic_schema_fields FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_full_access_dynamic_records"
  ON dynamic_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dynamic_schemas_updated_at
  BEFORE UPDATE ON dynamic_schemas
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_dynamic_records_updated_at
  BEFORE UPDATE ON dynamic_records
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
