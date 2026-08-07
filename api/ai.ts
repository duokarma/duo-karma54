import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

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
          schema_id: { type: "string", description: "The ID of the schema to fetch fields for." }
        },
        required: ["schema_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_records",
      description: "Search or list records from a specific schema.",
      parameters: {
        type: "object",
        properties: {
          schema_id: { type: "string", description: "The ID of the schema to search." },
          limit: { type: "number", description: "Number of records to return (max 50)." },
          search_term: { type: "string", description: "Optional search text to filter records." }
        },
        required: ["schema_id"]
      }
    }
  }
];

async function executeToolCall(toolCall: any) {
  const { name, arguments: argsString } = toolCall.function;
  const args = JSON.parse(argsString);

  try {
    if (name === "list_schemas") {
      const { data, error } = await supabase.from('dynamic_schemas').select('id, name, slug');
      if (error && error.code !== 'PGRST116') {
        // Ignore RLS errors if no dynamic schemas exist yet
        console.error("Dynamic schema fetch error:", error);
      }
      
      const nativeSchemas = [
        { id: "native_clients", name: "Clients (Contains totalValue/revenue, amountPaid, incomeType)", slug: "clients" },
        { id: "native_leads", name: "Leads (Contains lead value and status)", slug: "leads" },
        { id: "native_projects", name: "Projects", slug: "projects" },
        { id: "native_tasks", name: "Tasks", slug: "tasks" },
        { id: "native_financial_metrics", name: "Monthly Financial Metrics (Chart Data for Revenue, Expenses, Profit)", slug: "financial_metrics" },
        { id: "native_expenses", name: "Expenses Log", slug: "expenses" }
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
      if (args.schema_id.startsWith("native_")) {
        const tableName = args.schema_id.replace("native_", "");
        const { data, error } = await supabase.from(tableName).select('*').limit(args.limit || 50);
        if (error) throw error;
        return data;
      } else {
        let query = supabase
          .from('dynamic_records')
          .select('*')
          .eq('schema_id', args.schema_id)
          .limit(args.limit || 50);
          
        if (args.search_term) {
          query = query.textSearch('data', args.search_term);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
    }
    
    return { error: `Tool ${name} not found.` };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function fetchWithFallback(groqApiKey: string, cerebrasApiKey: string, payload: any) {
  let lastError = null;

  // Try Groq First
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
        return res; // Success from Groq
      }
    } catch (err: any) {
      if (err.message.includes("429") || err.message.includes("503") || err.message.includes("404") || err.message.includes("400")) {
        lastError = err.message;
      } else {
        throw err;
      }
    }
  }

  // Fallback to Cerebras
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
      return res; // Success from Cerebras
    } catch (err: any) {
      throw new Error(`Primary AI failed (${lastError}), and backup AI also failed: ${err.message}`);
    }
  }

  throw new Error(`All AI models failed. Groq Error: ${lastError}`);
}

export default async function handler(req: any, res: any) {
  // CORS handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY || '';
    const cerebrasApiKey = process.env.CEREBRAS_API_KEY || '';
    
    if (!groqApiKey && !cerebrasApiKey) {
      return res.status(500).json({ error: 'Missing API keys. Please configure GROQ_API_KEY or CEREBRAS_API_KEY' });
    }

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

    // 1. Initial Call to AI with Tools
    let currentMessages = [
      {
        role: 'system',
        content: "You are a helpful, data-aware business assistant for DuoKarma.\n\nIMPORTANT: If the user simply says hello, greets you, or asks a general question, just respond normally and conversationally. DO NOT call any tools.\n\nIF AND ONLY IF the user explicitly asks about their business data (e.g. 'How many clients do we have?', 'What are my projects?'), you must use your tools to find the answer:\n1. First, call `list_schemas` to find the exact `schema_id` for the topic.\n2. Next, call `search_records` using that `schema_id` to fetch the data.\n3. Answer the user based on the fetched data.\n\nDo not ask the user for a schema ID. Do not guess data."
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
          const result = await executeToolCall(toolCall);
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
