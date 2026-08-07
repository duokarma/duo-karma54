-- Enable Row Level Security
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."financial_metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."website_inquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dynamic_schemas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dynamic_schema_fields" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dynamic_records" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow ONLY authenticated users to read and write all data
-- (Assuming single-tenant architecture where all authenticated users have full access)

DO $$ 
DECLARE
    table_names text[] := ARRAY[
        'clients', 'leads', 'projects', 'tasks', 'expenses', 'documents', 
        'financial_metrics', 'website_inquiries', 'dynamic_schemas', 
        'dynamic_schema_fields', 'dynamic_records'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY table_names
    LOOP
        EXECUTE format('
            CREATE POLICY "Enable full access for authenticated users only" 
            ON "public".%I 
            AS PERMISSIVE 
            FOR ALL 
            TO authenticated 
            USING (true) 
            WITH CHECK (true);
        ', t);
    END LOOP;
END $$;
