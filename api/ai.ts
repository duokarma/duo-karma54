import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TOOL_LOOPS = 7;
const PROVIDER_TIMEOUT_MS = 25_000; // 25 s per provider call
const DEFAULT_SEARCH_LIMIT = 50;
const MAX_SEARCH_LIMIT = 100;

/** HTTP statuses that mean "try next provider"; anything else is fatal. */
const RETRIABLE_STATUSES = new Set([429, 502, 503, 504]);

const MODELS = {
  GEMINI:   'gemini-flash-latest',
  GROQ:     'llama-3.3-70b-versatile',
  CEREBRAS: 'gemma-4-31b',
} as const;

const ENDPOINTS = {
  GEMINI:   'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  GROQ:     'https://api.groq.com/openai/v1/chat/completions',
  CEREBRAS: 'https://api.cerebras.ai/v1/chat/completions',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE SCHEMA DEFINITIONS  (single source of truth — no duplication)
// ─────────────────────────────────────────────────────────────────────────────

const NATIVE_SCHEMAS = [
  { id: 'native_clients',           name: 'Clients (Contains totalValue/revenue, amountPaid, incomeType, status)', slug: 'clients' },
  { id: 'native_leads',             name: 'Leads (Contains lead value and status)',                                  slug: 'leads' },
  { id: 'native_projects',          name: 'Projects',                                                               slug: 'projects' },
  { id: 'native_tasks',             name: 'Tasks',                                                                   slug: 'tasks' },
  { id: 'native_financial_metrics', name: 'Monthly Financial Metrics (Chart Data for Revenue, Expenses, Profit)',    slug: 'financial_metrics' },
  { id: 'native_expenses',          name: 'Expenses Log (amount, category, description, date)',                      slug: 'expenses' },
  { id: 'native_documents',         name: 'Documents (Uploaded files)',                                              slug: 'documents' },
  { id: 'native_client_growth',     name: 'Client Growth Analytics',                                                slug: 'client_growth' },
  { id: 'native_lead_conversion',   name: 'Lead Conversion Analytics',                                              slug: 'lead_conversion' },
  { id: 'native_expense_breakdown', name: 'Expense Breakdown Analytics',                                            slug: 'expense_breakdown' },
] as const;

const NATIVE_FIELDS: Record<string, Array<{ name: string; type: string }>> = {
  clients: [
    { name: 'id',            type: 'string' }, { name: 'name',          type: 'string' }, { name: 'company',       type: 'string' },
    { name: 'email',         type: 'string' }, { name: 'phone',         type: 'string' }, { name: 'status',        type: 'string' },
    { name: 'totalValue',    type: 'number' }, { name: 'projectsCount', type: 'number' }, { name: 'joinedDate',    type: 'string' },
    { name: 'location',      type: 'string' }, { name: 'amountPaid',    type: 'number' }, { name: 'incomeType',    type: 'string' },
  ],
  leads: [
    { name: 'id',         type: 'string' }, { name: 'name',       type: 'string' }, { name: 'company',    type: 'string' },
    { name: 'email',      type: 'string' }, { name: 'phone',      type: 'string' }, { name: 'source',     type: 'string' },
    { name: 'value',      type: 'number' }, { name: 'stage',      type: 'string' }, { name: 'probability',type: 'number' },
    { name: 'assignedTo', type: 'string' },
  ],
  projects: [
    { name: 'id',       type: 'string' }, { name: 'name',     type: 'string' }, { name: 'client',   type: 'string' },
    { name: 'status',   type: 'string' }, { name: 'progress', type: 'number' }, { name: 'budget',   type: 'number' },
    { name: 'spent',    type: 'number' }, { name: 'priority', type: 'string' },
  ],
  tasks: [
    { name: 'id',       type: 'string' }, { name: 'title',    type: 'string' }, { name: 'project',  type: 'string' },
    { name: 'assignee', type: 'string' }, { name: 'priority', type: 'string' }, { name: 'status',   type: 'string' },
  ],
  expenses: [
    { name: 'id',          type: 'string' }, { name: 'description', type: 'string' }, { name: 'category', type: 'string' },
    { name: 'amount',      type: 'number' }, { name: 'date',        type: 'string' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TOOLS  (unchanged — same schema the AI already knows)
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'list_schemas',
      description: 'Get a list of all data tables (schemas) available in the admin panel.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_schema_fields',
      description: 'Get the fields (columns) of a specific schema/table.',
      parameters: {
        type: 'object',
        properties: {
          schema_id: { type: 'string', description: "The EXACT 'id' field (UUID) from the list_schemas response. Do not use the slug or name." },
        },
        required: ['schema_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_records',
      description: 'Search or list records from a specific schema. Use this to fetch data to answer questions.',
      parameters: {
        type: 'object',
        properties: {
          schema_id:   { type: 'string', description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          limit:       { type: 'number', description: 'Number of records to return (max 100). Default is 50 to optimize memory.' },
          search_term: { type: 'string', description: 'Optional search text to filter records.' },
        },
        required: ['schema_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'insert_record',
      description: 'Insert a new record into a specific schema. Use this when the user asks to create or add something.',
      parameters: {
        type: 'object',
        properties: {
          schema_id: { type: 'string', description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record:    { type: 'object', description: 'A JSON object containing the field names and their values to insert.' },
        },
        required: ['schema_id', 'record'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_record',
      description: 'Update an existing record in a schema. Use this when the user asks to modify, update, or change a status.',
      parameters: {
        type: 'object',
        properties: {
          schema_id: { type: 'string', description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record_id: { type: 'string', description: 'The ID of the record to update.' },
          updates:   { type: 'object', description: 'A JSON object containing only the fields to update and their new values.' },
        },
        required: ['schema_id', 'record_id', 'updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_record',
      description: 'Delete a record from a schema. Use this when the user asks to delete or remove something.',
      parameters: {
        type: 'object',
        properties: {
          schema_id: { type: 'string', description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record_id: { type: 'string', description: 'The ID of the record to delete.' },
        },
        required: ['schema_id', 'record_id'],
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER  — structured, tagged with per-request ID
// ─────────────────────────────────────────────────────────────────────────────

type Logger = ReturnType<typeof createLogger>;

function createLogger(requestId: string) {
  const tag = `[AI:${requestId}]`;
  return {
    info:  (msg: string, data?: object) => console.log( `${tag} INFO  ${msg}`, data ?? ''),
    warn:  (msg: string, data?: object) => console.warn( `${tag} WARN  ${msg}`, data ?? ''),
    error: (msg: string, data?: object) => console.error(`${tag} ERROR ${msg}`, data ?? ''),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Wraps fetch with an AbortController timeout. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timerId);
  }
}

/** Safe JSON.parse for tool arguments with a descriptive error on failure. */
function parseToolArgs(raw: string, toolName: string): Record<string, any> {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('must be a JSON object');
    }
    return parsed;
  } catch (err: any) {
    throw new Error(`Invalid arguments for tool "${toolName}": ${err.message}`);
  }
}

/**
 * Collision-resistant ID generator.
 * Prefers the platform crypto API; falls back to a timestamp+random hybrid
 * that is far more collision-resistant than the previous Math.random() approach.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID() as string;
  }
  // Fallback: timestamp (ms) + 16 random hex chars
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT HINT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A minimal record reference returned to the frontend inside `_context`.
 * The frontend's ai-context.ts module uses this to update its working memory.
 */
interface TouchedRecord {
  id:    string;
  name:  string;
  table: string;
}

/** Name fields to scan for, in priority order. */
const NAME_FIELDS = ['name', 'title', 'description', 'company'] as const;

/** Extract the best human-readable name from a DB record object. */
function getRecordName(record: Record<string, any>): string | null {
  for (const field of NAME_FIELDS) {
    const val = record[field];
    if (val && typeof val === 'string' && val.trim()) return val.trim();
  }
  return null;
}

/**
 * Extracts entity references from a tool result so the frontend can
 * update its lightweight working memory without parsing AI text.
 *
 * Rules:
 *  - search_records with ≤ 3 rows → add each row (likely a targeted lookup)
 *  - insert_record / update_record → add the affected row from data[]
 *  - delete_record → skip (we no longer have the name)
 *  - get_schema_fields / list_schemas → skip (meta, not data)
 */
function extractEntityRefs(
  toolName: string,
  result:   Record<string, any>,
  schemaId: string,
): TouchedRecord[] {
  if (result.error) return [];

  const table = schemaId.replace('native_', '');
  const refs:  TouchedRecord[] = [];

  if (toolName === 'search_records') {
    const rows: any[] = Array.isArray(result) ? result : [];
    // Only consider targeted lookups (≤ 3 rows) to avoid polluting context
    // with bulk-fetch noise (e.g. "list all clients" returning 50 rows).
    if (rows.length > 0 && rows.length <= 3) {
      for (const row of rows) {
        const name = getRecordName(row);
        if (name && row.id) refs.push({ id: String(row.id), name, table });
      }
    }
    return refs;
  }

  if (toolName === 'insert_record' || toolName === 'update_record') {
    const rows: any[] = Array.isArray(result.data) ? result.data : [];
    for (const row of rows.slice(0, 1)) { // Only first row needed
      const name = getRecordName(row);
      if (name && row.id) refs.push({ id: String(row.id), name, table });
    }
    return refs;
  }

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE SANITIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips any provider-specific metadata (e.g. Gemini's `extra_content`) from
 * the message history so every provider in the fallback chain accepts it.
 */
function sanitizeMessages(messages: any[]): any[] {
  return messages
    .filter((m: any) => m.role !== 'system')
    .map((m: any) => {
      const clean: Record<string, any> = {
        role:    m.role,
        content: m.content ?? null,
      };
      if (Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
        clean.tool_calls = m.tool_calls.map((tc: any) => ({
          id:       tc.id,
          type:     tc.type ?? 'function',
          function: { name: tc.function.name, arguments: tc.function.arguments },
        }));
      }
      if (m.tool_call_id) clean.tool_call_id = m.tool_call_id;
      if (m.name)         clean.name          = m.name;
      return clean;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL EXECUTION
// ─────────────────────────────────────────────────────────────────────────────

async function executeToolCall(
  toolCall: any,
  supabase:  any,
  log:       Logger,
): Promise<Record<string, any>> {
  const { name, arguments: rawArgs } = toolCall.function;
  log.info(`Tool call: ${name}`);

  // 1. Parse arguments safely
  let args: Record<string, any>;
  try {
    args = parseToolArgs(rawArgs, name);
  } catch (err: any) {
    log.error('Tool argument parse failed', { tool: name, error: err.message });
    return { error: err.message };
  }

  // 2. Execute
  try {
    switch (name) {

      // ── list_schemas ──────────────────────────────────────────────────────
      case 'list_schemas': {
        const { data, error } = await supabase
          .from('dynamic_schemas')
          .select('id, name, slug');

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = table empty; anything else is worth logging
          log.warn('dynamic_schemas fetch error (non-fatal)', { code: error.code, msg: error.message });
        }

        return { schemas: [...NATIVE_SCHEMAS, ...(data ?? [])] };
      }

      // ── get_schema_fields ────────────────────────────────────────────────
      case 'get_schema_fields': {
        const { schema_id } = args;
        if (!schema_id || typeof schema_id !== 'string') {
          return { error: 'schema_id is required and must be a string.' };
        }

        if (schema_id.startsWith('native_')) {
          const tableName = schema_id.replace('native_', '');
          const fields    = NATIVE_FIELDS[tableName];
          return fields
            ? fields
            : { message: `No explicit field map for "${tableName}". Infer columns from the table name.` };
        }

        const { data, error } = await supabase
          .from('dynamic_schema_fields')
          .select('*')
          .eq('schema_id', schema_id);
        if (error) throw error;
        return data ?? [];
      }

      // ── search_records ────────────────────────────────────────────────────
      case 'search_records': {
        const { schema_id, limit: rawLimit, search_term } = args;
        if (!schema_id || typeof schema_id !== 'string') {
          return { error: 'schema_id is required and must be a string.' };
        }

        // Clamp limit to a safe window
        const limit = typeof rawLimit === 'number'
          ? Math.min(Math.max(1, rawLimit), MAX_SEARCH_LIMIT)
          : DEFAULT_SEARCH_LIMIT;

        if (schema_id.startsWith('native_')) {
          const tableName = schema_id.replace('native_', '');
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(limit);
          if (error) throw error;
          return data ?? [];
        }

        // Dynamic collections — use ilike for basic text search
        // (avoids the broken textSearch/tsvector path)
        let query = supabase
          .from('dynamic_records')
          .select('*')
          .eq('schema_id', schema_id)
          .limit(limit);

        if (search_term && typeof search_term === 'string' && search_term.trim()) {
          query = query.ilike('data::text', `%${search_term.trim()}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      }

      // ── insert_record ─────────────────────────────────────────────────────
      case 'insert_record': {
        const { schema_id, record } = args;
        if (!schema_id || typeof schema_id !== 'string') {
          return { error: 'schema_id is required and must be a string.' };
        }
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
          return { error: 'record must be a non-null JSON object.' };
        }

        // Ensure every new record gets a stable unique ID
        const recordToInsert = { ...record };
        if (!recordToInsert.id) {
          recordToInsert.id = generateId();
        }

        if (schema_id.startsWith('native_')) {
          const tableName = schema_id.replace('native_', '');
          const { data, error } = await supabase
            .from(tableName)
            .insert([recordToInsert])
            .select();
          if (error) throw error;
          return { success: true, data, mutatedTable: tableName };
        }

        const { data, error } = await supabase
          .from('dynamic_records')
          .insert([{ schema_id, data: recordToInsert }])
          .select();
        if (error) throw error;
        return { success: true, data, mutatedTable: 'dynamic_records' };
      }

      // ── update_record ─────────────────────────────────────────────────────
      case 'update_record': {
        const { schema_id, record_id, updates } = args;
        if (!schema_id  || typeof schema_id  !== 'string') return { error: 'schema_id is required.'  };
        if (!record_id  || typeof record_id  !== 'string') return { error: 'record_id is required.'  };
        if (!updates    || typeof updates    !== 'object' || Array.isArray(updates)) {
          return { error: 'updates must be a non-null JSON object.' };
        }

        if (schema_id.startsWith('native_')) {
          const tableName = schema_id.replace('native_', '');
          const { data, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', record_id)
            .select();
          if (error) throw error;
          return { success: true, data, mutatedTable: tableName };
        }

        const { data, error } = await supabase
          .from('dynamic_records')
          .update({ data: updates })
          .eq('id', record_id)
          .select();
        if (error) throw error;
        return { success: true, data, mutatedTable: 'dynamic_records' };
      }

      // ── delete_record ─────────────────────────────────────────────────────
      case 'delete_record': {
        const { schema_id, record_id } = args;
        if (!schema_id || typeof schema_id !== 'string') return { error: 'schema_id is required.' };
        if (!record_id || typeof record_id !== 'string') return { error: 'record_id is required.' };

        if (schema_id.startsWith('native_')) {
          const tableName = schema_id.replace('native_', '');
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', record_id);
          if (error) throw error;
          return { success: true, mutatedTable: tableName };
        }

        const { error } = await supabase
          .from('dynamic_records')
          .delete()
          .eq('id', record_id);
        if (error) throw error;
        return { success: true, mutatedTable: 'dynamic_records' };
      }

      // ── unknown tool ──────────────────────────────────────────────────────
      default:
        log.warn(`Unknown tool called: "${name}"`);
        return {
          error: `Unknown tool "${name}". Available tools: list_schemas, get_schema_fields, search_records, insert_record, update_record, delete_record`,
        };
    }
  } catch (err: any) {
    log.error(`Tool "${name}" database error`, { error: err.message });
    return { error: `Database error in ${name}: ${err.message}` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FALLBACK CHAIN
// ─────────────────────────────────────────────────────────────────────────────

interface ProviderConfig {
  name:     string;
  endpoint: string;
  apiKey:   string;
  model:    string;
}

/**
 * Attempts a single provider call with a per-request timeout.
 * Throws with `err.retriable = true` for rate-limit / server errors
 * so the caller knows to try the next provider.
 * Throws without `retriable` for configuration / auth errors (fatal).
 */
async function callProvider(
  provider: ProviderConfig,
  payload:  Record<string, any>,
  log:      Logger,
): Promise<Response> {
  log.info(`Trying provider: ${provider.name}`, { model: provider.model });

  const body = JSON.stringify({ ...payload, model: provider.model });

  let res: Response;
  try {
    res = await fetchWithTimeout(
      provider.endpoint,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
      },
      PROVIDER_TIMEOUT_MS,
    );
  } catch (err: any) {
    // Network error or timeout — retriable
    log.warn(`Provider ${provider.name} network error`, { error: err.message });
    throw Object.assign(err, { retriable: true });
  }

  if (res.ok) {
    log.info(`Provider ${provider.name} succeeded`);
    return res;
  }

  const text = await res.text();

  if (RETRIABLE_STATUSES.has(res.status)) {
    log.warn(`Provider ${provider.name} retriable error`, { status: res.status });
    throw Object.assign(
      new Error(`${provider.name} [${res.status}]: ${text}`),
      { retriable: true },
    );
  }

  // 401 / 403 / 400 etc. — fatal, do not continue to next provider
  log.error(`Provider ${provider.name} fatal error`, { status: res.status, body: text });
  throw new Error(`${provider.name} fatal error [${res.status}]: ${text}`);
}

/**
 * Tries providers in order: Gemini → Groq → Cerebras.
 * Skips providers whose API key is not configured.
 * Propagates fatal errors immediately.
 * Falls through to the next provider only on retriable errors.
 */
async function fetchWithFallback(
  keys: { gemini: string; groq: string; cerebras: string },
  payload: Record<string, any>,
  log: Logger,
): Promise<Response> {
  const providers: ProviderConfig[] = [
    keys.gemini   && { name: 'Gemini',   endpoint: ENDPOINTS.GEMINI,   apiKey: keys.gemini,   model: MODELS.GEMINI   },
    keys.groq     && { name: 'Groq',     endpoint: ENDPOINTS.GROQ,     apiKey: keys.groq,     model: MODELS.GROQ     },
    keys.cerebras && { name: 'Cerebras', endpoint: ENDPOINTS.CEREBRAS, apiKey: keys.cerebras, model: MODELS.CEREBRAS },
  ].filter(Boolean) as ProviderConfig[];

  if (providers.length === 0) {
    throw new Error('No AI providers configured. Set at least one of GEMINI_API_KEY, GROQ_API_KEY, or CEREBRAS_API_KEY.');
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      return await callProvider(provider, payload, log);
    } catch (err: any) {
      errors.push(`${provider.name}: ${err.message}`);
      if (!err.retriable) {
        // Fatal error — surface immediately without trying the rest
        throw err;
      }
      log.warn(`Falling back from ${provider.name} to next provider`);
    }
  }

  // All providers exhausted
  throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are duo-AI, a highly intelligent, proactive, Tony Stark JARVIS-like business assistant for DuoKarma. You are deeply integrated into the admin dashboard.

IMPORTANT: If the user asks a casual question or greets you, respond conversationally with a sharp, professional, and slightly witty JARVIS-like tone. DO NOT call any tools.

IF the user asks about their business data (e.g. 'Which client paid the most?', 'What are my projects?', 'list incomplete records'), you MUST act as an elite data analyst:
1. Call \`list_schemas\` to find the exact \`schema_id\`.
2. Call \`search_records\` using that \`schema_id\` to fetch the data.
3. **CRITICAL**: Analyze the data logically. If they ask for incomplete records, filter the data to find missing fields. Provide a precise, accurate answer.

IF the user asks to ADD, UPDATE, or DELETE something (e.g. 'add a client', 'set Hatim to inactive', 'set Hatim to 5000', 'delete project X'):
1. Call \`list_schemas\` to find the schema_id.
2. **CRITICAL**: Call \`get_schema_fields\` to find the exact column names (like \`totalValue\`, \`amountPaid\`, \`status\`) so you don't guess the wrong names!
3. If updating or deleting, call \`search_records\` first to find the exact \`id\` of the specific record.
4. Call \`insert_record\`, \`update_record\`, or \`delete_record\` using the correct column names from step 2.
5. Check the tool response. If there is an error, YOU MUST tell the user the exact error message. Only confirm success if the tool succeeded and returned data.`;

export default async function handler(req: any, res: any) {
  // ── CORS pre-flight ──────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Per-request logger ────────────────────────────────────────────────────
  const requestId = Math.random().toString(36).slice(2, 9);
  const log       = createLogger(requestId);
  log.info('Request received', { action: req.body?.action });

  try {
    // ── API keys ─────────────────────────────────────────────────────────
    const keys = {
      gemini:   process.env.GEMINI_API_KEY   ?? '',
      groq:     process.env.GROQ_API_KEY     ?? '',
      cerebras: process.env.CEREBRAS_API_KEY ?? '',
    };

    if (!keys.gemini && !keys.groq && !keys.cerebras) {
      log.error('No API keys configured');
      return res.status(500).json({ error: 'Server configuration error: no AI provider keys are set.' });
    }

    // ── Supabase client (forwards user JWT when present) ──────────────────
    const authHeader  = req.headers.authorization as string | undefined;
    const supabaseUrl = process.env.VITE_SUPABASE_URL     ?? '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // ── Request body ──────────────────────────────────────────────────────
    const { action, prompt, messages, systemPrompt } = req.body ?? {};

    // ── schema action (used by schema-builder page) ───────────────────────
    if (action === 'schema') {
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'prompt is required for action "schema".' });
      }

      const payload = {
        temperature:     0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt || 'You are a database architect. Return JSON only.' },
          { role: 'user',   content: prompt },
        ],
      };

      const r = await fetchWithFallback(keys, payload, log);
      return res.status(200).json(await r.json());
    }

    // ── chat action ───────────────────────────────────────────────────────
    if (action !== 'chat') {
      return res.status(400).json({ error: `Invalid action "${action}". Supported actions: chat, schema.` });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array for action "chat".' });
    }

    // Build sanitized message history.
    // The frontend sends a context block prefix in its placeholder system message.
    // We extract it here and prepend it to the authoritative SYSTEM_PROMPT so
    // the AI knows the current page, focused entity, and recent records.
    const clientSystemMsg  = messages.find((m: any) => m.role === 'system');
    const clientContextBlock: string = (() => {
      const content: string = clientSystemMsg?.content ?? '';
      // The context block is demarcated by [CONTEXT]...[/CONTEXT]
      const match = content.match(/\[CONTEXT\][\s\S]*?\[\/CONTEXT\]\n\n/m);
      return match ? match[0] : '';
    })();

    const effectiveSystemPrompt = clientContextBlock
      ? `${clientContextBlock}${SYSTEM_PROMPT}`
      : SYSTEM_PROMPT;

    let currentMessages = [
      { role: 'system', content: effectiveSystemPrompt },
      ...sanitizeMessages(messages),
    ];

    const chatPayload = {
      tools:       TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
    };

    let aiRes = await fetchWithFallback(keys, { ...chatPayload, messages: currentMessages }, log);

    let responseData    = await aiRes.json();
    let responseMessage = responseData?.choices?.[0]?.message;

    if (!responseMessage) {
      log.error('Malformed AI response — no choices[0].message', { raw: JSON.stringify(responseData).slice(0, 300) });
      return res.status(502).json({ error: 'AI provider returned an unexpected response format.' });
    }

    // ── Agentic tool loop ─────────────────────────────────────────────────
    let loops = 0;
    /** Entity refs collected during tool execution — sent back to the frontend. */
    const contextHints: TouchedRecord[] = [];

    while (responseMessage.tool_calls && loops < MAX_TOOL_LOOPS) {
      loops++;
      log.info(`Tool loop iteration ${loops}/${MAX_TOOL_LOOPS}`, {
        tools: responseMessage.tool_calls.map((tc: any) => tc.function.name),
      });

      // Push the assistant's tool-call message into history
      currentMessages.push(responseMessage);

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall: any) => {
          const result   = await executeToolCall(toolCall, supabase, log);
          const toolName = toolCall.function.name;

          // Extract entity refs for lightweight context update on the frontend
          try {
            const args     = JSON.parse(toolCall.function.arguments ?? '{}');
            const schemaId = args.schema_id ?? '';
            const refs     = extractEntityRefs(toolName, result, schemaId);
            for (const ref of refs) {
              if (!contextHints.some((h) => h.id === ref.id)) {
                contextHints.push(ref);
              }
            }
          } catch {
            // Never let context extraction break the tool flow
          }

          return {
            tool_call_id: toolCall.id,
            role:         'tool',
            name:         toolName,
            content:      JSON.stringify(result),
          };
        }),
      );

      currentMessages.push(...toolResults);

      // Call AI again with the new tool results
      aiRes = await fetchWithFallback(
        keys,
        { ...chatPayload, messages: currentMessages },
        log,
      );

      responseData    = await aiRes.json();
      responseMessage = responseData?.choices?.[0]?.message;

      if (!responseMessage) {
        log.error('Malformed AI response in tool loop', { loop: loops });
        break;
      }
    }

    if (loops >= MAX_TOOL_LOOPS) {
      log.warn('MAX_TOOL_LOOPS reached — returning partial response');
    }

    log.info('Request completed successfully', { loops, contextHints: contextHints.length });

    // Attach entity hints so the frontend can update its lightweight working memory.
    // Only included when at least one entity was touched to keep the payload clean.
    const finalPayload: Record<string, any> = { ...responseData };
    if (contextHints.length > 0) {
      finalPayload._context = { touchedRecords: contextHints };
    }
    return res.status(200).json(finalPayload);

  } catch (error: any) {
    log.error('Unhandled handler error', { error: error.message });
    // Return 200 with structured error so the frontend can display it
    // without triggering the raw JSON parse error path
    return res.status(200).json({
      choices: [{
        message: {
          role:    'assistant',
          content: `⚠️ Something went wrong on the server side. Please try again in a moment.\n\n_Details: ${error.message}_`,
        },
      }],
    });
  }
}
