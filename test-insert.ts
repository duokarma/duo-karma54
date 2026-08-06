import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: schema, error: schemaError } = await supabase
    .from("dynamic_schemas")
    .insert([{ name: "Test Schema", slug: "test_schema", icon: "Database" }])
    .select()
    .single();

  if (schemaError) {
    console.error("Schema error:", schemaError);
    return;
  }
  
  console.log("Schema created:", schema.id);

  const fields = [
    {
      schema_id: schema.id,
      name: "Field 1",
      slug: "field_1",
      type: "text",
      is_required: false,
      options: null,
      sort_order: 0
    }
  ];

  const { error: fieldsError } = await supabase
    .from("dynamic_schema_fields")
    .insert(fields);

  if (fieldsError) {
    console.error("Fields error:", fieldsError);
  } else {
    console.log("Fields created successfully!");
  }
}

test();
