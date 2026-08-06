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
      if (error) throw error;
      return data;
    } 
    
    else if (name === "get_schema_fields") {
      const { data, error } = await supabase
        .from('dynamic_schema_fields')
        .select('*')
        .eq('schema_id', args.schema_id);
      if (error) throw error;
      return data;
    } 
    
    else if (name === "search_records") {
      let query = supabase
        .from('dynamic_records')
        .select('*')
        .eq('schema_id', args.schema_id)
        .limit(args.limit || 10);
        
      if (args.search_term) {
        query = query.textSearch('data', args.search_term);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    
    return { error: `Tool ${name} not found.` };
  } catch (err: any) {
    return { error: err.message };
  }
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
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable' });
    }

    const { action, prompt, messages, systemPrompt } = req.body;

    if (action === "schema") {
      const payload = {
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt || "You are a database architect. Return JSON only." },
          { role: "user", content: prompt }
        ]
      };
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return res.status(200).json(await r.json());
    }

    if (action !== "chat") {
      return res.status(400).json({ error: "Invalid action" });
    }

    // 1. Initial Call to Groq with Tools
    let currentMessages = [...messages];
    // Add system message if not present
    if (!currentMessages.find(m => m.role === 'system')) {
       currentMessages.unshift({
           role: 'system',
           content: 'You are an intelligent data-aware business assistant. You have tools to read the database schemas and records. When a user asks about their data, use your tools to find the answer. Do not guess. If a tool call fails, tell the user.'
       });
    }

    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    
    let groqRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: currentMessages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.2
      })
    });

    if (!groqRes.ok) throw new Error(await groqRes.text());
    let data = await groqRes.json();
    let responseMessage = data.choices[0].message;

    // 2. Loop if the model wants to call tools
    let MAX_LOOPS = 3; // Prevent infinite loops
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

      // Call Groq again with the tool results
      groqRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: currentMessages,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.2
        })
      });

      if (!groqRes.ok) throw new Error(await groqRes.text());
      data = await groqRes.json();
      responseMessage = data.choices[0].message;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Groq Handler Error:", error);
    return res.status(400).json({ error: error.message });
  }
}
