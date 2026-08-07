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
          limit: { type: "number", description: "Number of records to return (max 1000). Default is 1000 to allow full data analysis." },
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
        return { message: "Built-in tables do not have dynamic fields. You can proceed to call search_records directly." };
      }
      const { data, error } = await supabase
        .from('dynamic_schema_fields')
        .select('*')
        .eq('schema_id', args.schema_id);
      if (error) throw error;
      return data;
    } 
    
    else if (name === "search_records") {
      const limit = args.limit || 1000;
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
    
    return { error: `Tool ${name} not found.` };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function fetchWithFallback(groqApiKey: string, cerebrasApiKey: string, payload: any) {
  let lastError = null;

  if (groqApiKey) {
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
      payload.model = 'llama3.1-70b';
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
    const groqApiKey = process.env.GROQ_API_KEY || '';
    const cerebrasApiKey = process.env.CEREBRAS_API_KEY || '';
    
    if (!groqApiKey && !cerebrasApiKey) {
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
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt || "You are a database architect. Return JSON only." },
          { role: "user", content: prompt }
        ]
      };
      const r = await fetchWithFallback(groqApiKey, cerebrasApiKey, payload);
      return res.status(200).json(await r.json());
    }

    if (action !== "chat") {
      return res.status(400).json({ error: "Invalid action" });
    }

    let currentMessages = [
      {
        role: 'system',
        content: "You are duo-AI, a highly intelligent, proactive, Tony Stark JARVIS-like business assistant for DuoKarma. You are deeply integrated into the admin dashboard.\n\nIMPORTANT: If the user asks a casual question or greets you, respond conversationally with a sharp, professional, and slightly witty JARVIS-like tone. DO NOT call any tools.\n\nIF the user asks about their business data (e.g. 'Which client paid the most?', 'What are my projects?', 'list incomplete records'), you MUST act as an elite data analyst:\n1. Call `list_schemas` to find the exact `schema_id`.\n2. Call `search_records` using that `schema_id` to fetch the data.\n3. **CRITICAL**: Analyze the data logically. If they ask for incomplete records, filter the data to find missing fields. Provide a precise, accurate answer.\n\nIF the user asks to ADD or CREATE something (e.g. 'add a new client named Hatim with phone 8758457909'):\n1. Call `list_schemas` to find the schema_id.\n2. Call `insert_record` with the schema_id and the fields they provided. DO NOT ask the user for missing fields; the database will use defaults for anything omitted.\n3. Confirm success conversationally."
      },
      ...messages.filter((m: any) => m.role !== 'system')
    ];

    let aiRes = await fetchWithFallback(groqApiKey, cerebrasApiKey, {
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
      aiRes = await fetchWithFallback(groqApiKey, cerebrasApiKey, {
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
