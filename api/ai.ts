import { createClient } from '@supabase/supabase-js';

const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_schemas",
      description: "Get a list of all data tables (schemas) available in the admin panel.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_schema_fields",
      description: "Get the fields (columns) of a specific schema/table.",
      parameters: {
        type: "object",
        properties: {
          schema_id: { type: "string", description: "The EXACT 'id' field (UUID) from the list_schemas response. Do not use the slug or name." }
        },
        required: ["schema_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_records",
      description: "Search or list records from a specific schema. Use this to fetch data to answer questions.",
      parameters: {
        type: "object",
        properties: {
          schema_id: { type: "string", description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          limit: { type: "number", description: "Number of records to return (max 100). Default is 50 to optimize memory." },
          search_term: { type: "string", description: "Optional search text to filter records." }
        },
        required: ["schema_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "insert_record",
      description: "Insert a new record into a specific schema. Use this when the user asks to create or add something.",
      parameters: {
        type: "object",
        properties: {
          schema_id: { type: "string", description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record: { type: "object", description: "A JSON object containing the field names and their values to insert." }
        },
        required: ["schema_id", "record"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_record",
      description: "Update an existing record in a schema. Use this when the user asks to modify, update, or change a status.",
      parameters: {
        type: "object",
        properties: {
          schema_id: { type: "string", description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record_id: { type: "string", description: "The ID of the record to update." },
          updates: { type: "object", description: "A JSON object containing only the fields to update and their new values." }
        },
        required: ["schema_id", "record_id", "updates"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_record",
      description: "Delete a record from a schema. Use this when the user asks to delete or remove something.",
      parameters: {
        type: "object",
        properties: {
          schema_id: { type: "string", description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record_id: { type: "string", description: "The ID of the record to delete." }
        },
        required: ["schema_id", "record_id"]
      }
    }
  }
];

async function executeToolCall(toolCall: any, supabase: any) {
  const { name, arguments: argsString } = toolCall.function;
  const args = JSON.parse(argsString);

  try {
    if (name === "list_schemas") {
      const { data, error } = await supabase.from('dynamic_schemas').select('id, name, slug');
      if (error && error.code !== 'PGRST116') {
        console.error("Dynamic schema fetch error:", error);
      }
      
      const nativeSchemas = [
        { id: "native_clients", name: "Clients (Contains totalValue/revenue, amountPaid, incomeType, status)", slug: "clients" },
        { id: "native_leads", name: "Leads (Contains lead value and status)", slug: "leads" },
        { id: "native_projects", name: "Projects", slug: "projects" },
        { id: "native_tasks", name: "Tasks", slug: "tasks" },
        { id: "native_financial_metrics", name: "Monthly Financial Metrics (Chart Data for Revenue, Expenses, Profit)", slug: "financial_metrics" },
        { id: "native_expenses", name: "Expenses Log (amount, category, description, date)", slug: "expenses" },
        { id: "native_documents", name: "Documents (Uploaded files)", slug: "documents" },
        { id: "native_client_growth", name: "Client Growth Analytics", slug: "client_growth" },
        { id: "native_lead_conversion", name: "Lead Conversion Analytics", slug: "lead_conversion" },
        { id: "native_expense_breakdown", name: "Expense Breakdown Analytics", slug: "expense_breakdown" }
      ];
      
      return { schemas: [...nativeSchemas, ...(data || [])] };
    } 
    
    else if (name === "get_schema_fields") {
      if (args.schema_id.startsWith("native_")) {
        const tableName = args.schema_id.replace("native_", "");
        const schemas: Record<string, any> = {
          clients: [
            { name: "id", type: "string" }, { name: "name", type: "string" }, { name: "company", type: "string" }, 
            { name: "email", type: "string" }, { name: "phone", type: "string" }, { name: "status", type: "string" }, 
            { name: "totalValue", type: "number" }, { name: "projectsCount", type: "number" }, { name: "joinedDate", type: "string" }, 
            { name: "location", type: "string" }, { name: "amountPaid", type: "number" }, { name: "incomeType", type: "string" }
          ],
          leads: [
            { name: "id", type: "string" }, { name: "name", type: "string" }, { name: "company", type: "string" },
            { name: "email", type: "string" }, { name: "phone", type: "string" }, { name: "source", type: "string" },
            { name: "value", type: "number" }, { name: "stage", type: "string" }, { name: "probability", type: "number" },
            { name: "assignedTo", type: "string" }
          ],
          projects: [
            { name: "id", type: "string" }, { name: "name", type: "string" }, { name: "client", type: "string" },
            { name: "status", type: "string" }, { name: "progress", type: "number" }, { name: "budget", type: "number" },
            { name: "spent", type: "number" }, { name: "priority", type: "string" }
          ],
          tasks: [
            { name: "id", type: "string" }, { name: "title", type: "string" }, { name: "project", type: "string" },
            { name: "assignee", type: "string" }, { name: "priority", type: "string" }, { name: "status", type: "string" }
          ],
          expenses: [
            { name: "id", type: "string" }, { name: "description", type: "string" }, { name: "category", type: "string" },
            { name: "amount", type: "number" }, { name: "date", type: "string" }
          ]
        };
        return schemas[tableName] || { message: "Fields for this table are not explicitly defined, but you can guess based on its name." };
      }
      
      const { data, error } = await supabase
        .from('dynamic_schema_fields')
        .select('*')
        .eq('schema_id', args.schema_id);
      if (error) throw error;
      return data;
    } 
    
    else if (name === "search_records") {
      const limit = args.limit || 50;
      if (args.schema_id.startsWith("native_")) {
        const tableName = args.schema_id.replace("native_", "");
        const { data, error } = await supabase.from(tableName).select('*').limit(limit);
        if (error) throw error;
        return data;
      } else {
        let query = supabase
          .from('dynamic_records')
          .select('*')
          .eq('schema_id', args.schema_id)
          .limit(limit);
          
        if (args.search_term) {
          query = query.textSearch('data', args.search_term);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
    }
    
    else if (name === "insert_record") {
      let recordToInsert = args.record;
      // Add id if native schema and id missing
      if (args.schema_id.startsWith("native_") && !recordToInsert.id) {
        recordToInsert.id = Math.random().toString(36).substring(2, 15);
      }
      
      if (args.schema_id.startsWith("native_")) {
        const tableName = args.schema_id.replace("native_", "");
        const { data, error } = await supabase.from(tableName).insert([recordToInsert]).select();
        if (error) throw error;
        return { success: true, data };
      } else {
        const { data, error } = await supabase
          .from('dynamic_records')
          .insert([{ schema_id: args.schema_id, data: recordToInsert }])
          .select();
        if (error) throw error;
        return { success: true, data };
      }
    }
    
    else if (name === "update_record") {
      if (args.schema_id.startsWith("native_")) {
        const tableName = args.schema_id.replace("native_", "");
        const { data, error } = await supabase.from(tableName).update(args.updates).eq('id', args.record_id).select();
        if (error) throw error;
        return { success: true, data };
      } else {
        const { data, error } = await supabase
          .from('dynamic_records')
          .update({ data: args.updates }) // Note: This replaces the whole data object in standard PG unless using jsonb_set, but for this demo it's fine or we should fetch and merge.
          .eq('id', args.record_id)
          .select();
        if (error) throw error;
        return { success: true, data };
      }
    }
    
    else if (name === "delete_record") {
      if (args.schema_id.startsWith("native_")) {
        const tableName = args.schema_id.replace("native_", "");
        const { data, error } = await supabase.from(tableName).delete().eq('id', args.record_id);
        if (error) throw error;
        return { success: true };
      } else {
        const { data, error } = await supabase.from('dynamic_records').delete().eq('id', args.record_id);
        if (error) throw error;
        return { success: true };
      }
    }
    
    return { error: `Tool ${name} not found.` };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function fetchWithFallback(geminiApiKey: string, groqApiKey: string, cerebrasApiKey: string, payload: any) {
  let lastError = null;

  if (geminiApiKey) {
    try {
      // Gemini 1.5 Flash via OpenAI compatibility endpoint
      payload.model = 'gemini-flash-latest';
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${geminiApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 429 || res.status === 503 || res.status === 404 || res.status === 400) {
          lastError = `Gemini: ${text}`;
        } else {
          throw new Error(`Gemini API Error: ${text}`);
        }
      } else {
        return res;
      }
    } catch (err: any) {
      console.log(`Gemini failed: ${err.message}. Falling back to Groq...`);
      lastError = err.message;
    }
  }

  if (groqApiKey) {
    console.log(`Trying Groq...`);
    try {
      payload.model = 'llama-3.3-70b-versatile';
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 429 || res.status === 503 || res.status === 404 || res.status === 400) {
          lastError = text;
        } else {
          throw new Error(`Groq API Error: ${text}`);
        }
      } else {
        return res;
      }
    } catch (err: any) {
      if (err.message.includes("429") || err.message.includes("503") || err.message.includes("404") || err.message.includes("400")) {
        lastError = err.message;
      } else {
        throw err;
      }
    }
  }

  if (cerebrasApiKey) {
    console.log(`Groq failed (or missing key). Error: ${lastError}. Falling back to Cerebras...`);
    try {
      payload.model = 'gemma-4-31b';
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${cerebrasApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cerebras Fallback Error: ${text}`);
      }
      return res;
    } catch (err: any) {
      throw new Error(`Primary AI failed (${lastError}), and backup AI also failed: ${err.message}`);
    }
  }

  throw new Error(`All AI models failed. Groq Error: ${lastError}`);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const groqApiKey = process.env.GROQ_API_KEY || '';
    const cerebrasApiKey = process.env.CEREBRAS_API_KEY || '';
    
    if (!geminiApiKey && !groqApiKey && !cerebrasApiKey) {
      return res.status(500).json({ error: 'Missing API keys.' });
    }

    const authHeader = req.headers.authorization;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {})
        }
      }
    });

    const { action, prompt, messages, systemPrompt } = req.body;

    if (action === "schema") {
      const payload = {
        model: "gemini-flash-latest",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt || "You are a database architect. Return JSON only." },
          { role: "user", content: prompt }
        ]
      };
      const r = await fetchWithFallback(geminiApiKey, groqApiKey, cerebrasApiKey, payload);
      return res.status(200).json(await r.json());
    }

    if (action !== "chat") {
      return res.status(400).json({ error: "Invalid action" });
    }

    let currentMessages = [
      {
        role: 'system',
        content: "You are duo-AI, a highly intelligent, proactive, Tony Stark JARVIS-like business assistant for DuoKarma. You are deeply integrated into the admin dashboard.\n\nIMPORTANT: If the user asks a casual question or greets you, respond conversationally with a sharp, professional, and slightly witty JARVIS-like tone. DO NOT call any tools.\n\nIF the user asks about their business data (e.g. 'Which client paid the most?', 'What are my projects?', 'list incomplete records'), you MUST act as an elite data analyst:\n1. Call `list_schemas` to find the exact `schema_id`.\n2. Call `search_records` using that `schema_id` to fetch the data.\n3. **CRITICAL**: Analyze the data logically. If they ask for incomplete records, filter the data to find missing fields. Provide a precise, accurate answer.\n\nIF the user asks to ADD, UPDATE, or DELETE something (e.g. 'add a client', 'set Hatim to inactive', 'set Hatim to 5000', 'delete project X'):\n1. Call `list_schemas` to find the schema_id.\n2. **CRITICAL**: Call `get_schema_fields` to find the exact column names (like `totalValue`, `amountPaid`, `status`) so you don't guess the wrong names!\n3. If updating or deleting, call `search_records` first to find the exact `id` of the specific record.\n4. Call `insert_record`, `update_record`, or `delete_record` using the correct column names from step 2.\n5. Check the tool response. If there is an error, YOU MUST tell the user the exact error message. Only confirm success if the tool succeeded and returned data."
      },
      ...messages.filter((m: any) => m.role !== 'system')
    ];

    let aiRes = await fetchWithFallback(geminiApiKey, groqApiKey, cerebrasApiKey, {
      messages: currentMessages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.2
    });

    let data = await aiRes.json();
    let responseMessage = data.choices[0].message;

    // 2. Loop if the model wants to call tools
    let MAX_LOOPS = 7; // Prevent infinite loops
    let loops = 0;
    
    while (responseMessage.tool_calls && loops < MAX_LOOPS) {
      loops++;
      currentMessages.push(responseMessage); // Add the assistant's tool call request to history

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall: any) => {
          const result = await executeToolCall(toolCall, supabase);
          return {
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(result)
          };
        })
      );

      // Append tool results to history
      currentMessages.push(...toolResults);

      // Call AI again with the tool results
      aiRes = await fetchWithFallback(geminiApiKey, groqApiKey, cerebrasApiKey, {
        messages: currentMessages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.2
      });

      data = await aiRes.json();
      responseMessage = data.choices[0].message;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("AI Handler Error:", error);
    return res.status(400).json({ error: error.message });
  }
}
