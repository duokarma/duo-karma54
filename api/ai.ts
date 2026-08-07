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
// INPUT VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

interface ValidationError { field: string; message: string; }
type Validator = (record: Record<string, any>) => ValidationError[];

/**
 * Per-table domain validators. Each function receives the record/updates object
 * and returns an array of field-level errors. An empty array means valid.
 *
 * Validators are intentionally lenient for UPDATE (partial patches) — they only
 * fire when the field is present in the payload. For INSERT, required-field
 * checks are handled separately by INSERT_REQUIRED_FIELDS below.
 */
const VALIDATORS: Record<string, Validator> = {
  clients: (r) => {
    const e: ValidationError[] = [];
    if (r.name         !== undefined && (!r.name || r.name.trim().length < 2))
      e.push({ field: 'name',        message: 'name must be at least 2 characters.' });
    if (r.email        !== undefined && r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))
      e.push({ field: 'email',       message: 'email is not a valid email address.' });
    if (r.totalValue   !== undefined && (typeof r.totalValue !== 'number' || r.totalValue < 0))
      e.push({ field: 'totalValue',  message: 'totalValue must be a non-negative number.' });
    if (r.amountPaid   !== undefined && (typeof r.amountPaid !== 'number' || r.amountPaid < 0))
      e.push({ field: 'amountPaid',  message: 'amountPaid must be a non-negative number.' });
    if (r.status       !== undefined && !['active', 'inactive'].includes(r.status))
      e.push({ field: 'status',      message: 'status must be "active" or "inactive".' });
    return e;
  },
  leads: (r) => {
    const e: ValidationError[] = [];
    if (r.value       !== undefined && (typeof r.value !== 'number' || r.value < 0))
      e.push({ field: 'value',       message: 'value must be a non-negative number.' });
    if (r.stage       !== undefined && !['new', 'negotiation', 'won'].includes(r.stage))
      e.push({ field: 'stage',       message: 'stage must be "new", "negotiation", or "won".' });
    if (r.probability !== undefined && (typeof r.probability !== 'number' || r.probability < 0 || r.probability > 100))
      e.push({ field: 'probability', message: 'probability must be a number between 0 and 100.' });
    return e;
  },
  projects: (r) => {
    const e: ValidationError[] = [];
    if (r.status   !== undefined && !['planning', 'in-progress', 'completed', 'on-hold'].includes(r.status))
      e.push({ field: 'status',   message: 'status must be "planning", "in-progress", "completed", or "on-hold".' });
    if (r.progress !== undefined && (typeof r.progress !== 'number' || r.progress < 0 || r.progress > 100))
      e.push({ field: 'progress', message: 'progress must be a number between 0 and 100.' });
    if (r.budget   !== undefined && (typeof r.budget   !== 'number' || r.budget   < 0))
      e.push({ field: 'budget',   message: 'budget must be a non-negative number.' });
    if (r.spent    !== undefined && (typeof r.spent    !== 'number' || r.spent    < 0))
      e.push({ field: 'spent',    message: 'spent must be a non-negative number.' });
    if (r.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(r.priority))
      e.push({ field: 'priority', message: 'priority must be "low", "medium", "high", or "urgent".' });
    return e;
  },
  tasks: (r) => {
    const e: ValidationError[] = [];
    if (r.status   !== undefined && !['todo', 'in-progress', 'review', 'completed'].includes(r.status))
      e.push({ field: 'status',   message: 'status must be "todo", "in-progress", "review", or "completed".' });
    if (r.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(r.priority))
      e.push({ field: 'priority', message: 'priority must be "low", "medium", "high", or "urgent".' });
    return e;
  },
  expenses: (r) => {
    const e: ValidationError[] = [];
    if (r.amount !== undefined && (typeof r.amount !== 'number' || r.amount < 0))
      e.push({ field: 'amount', message: 'amount must be a non-negative number.' });
    if (r.category !== undefined && (!r.category || typeof r.category !== 'string'))
      e.push({ field: 'category', message: 'category must be a non-empty string.' });
    return e;
  },
};

/** Fields that MUST be present when creating a new record. */
const INSERT_REQUIRED_FIELDS: Record<string, string[]> = {
  clients:  ['name'],
  leads:    ['name', 'stage'],
  projects: ['name'],
  tasks:    ['title'],
  expenses: ['description', 'amount'],
};

/**
 * Validates a record object against both required-field rules (insert mode)
 * and domain rules. Returns a human-readable error string or null if valid.
 */
function validateRecord(
  tableName: string,
  record:    Record<string, any>,
  mode:      'insert' | 'update',
): string | null {
  // Required-field check (insert only)
  if (mode === 'insert') {
    const required = INSERT_REQUIRED_FIELDS[tableName] ?? [];
    const missing  = required.filter(f => record[f] === undefined || record[f] === null || record[f] === '');
    if (missing.length > 0) {
      return `Missing required fields for ${tableName}: ${missing.join(', ')}.`;
    }
  }

  // Domain validation
  const validator = VALIDATORS[tableName];
  if (!validator) return null;

  const errors = validator(record);
  if (errors.length === 0) return null;

  return `Validation failed:\n${errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD TOOLS  — fine-grained record-level operations
// ─────────────────────────────────────────────────────────────────────────────

const CRUD_TOOLS = [
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
      description: 'Permanently delete a record. IMPORTANT: You MUST call this with confirmed=false first to get a confirmation prompt to show the user. Only call again with confirmed=true after the user has explicitly said yes, confirmed, or agreed to the deletion.',
      parameters: {
        type: 'object',
        properties: {
          schema_id:   { type: 'string',  description: "The EXACT 'id' field (UUID) from the list_schemas response." },
          record_id:   { type: 'string',  description: 'The ID of the record to delete.' },
          record_name: { type: 'string',  description: 'The human-readable name/title of the record being deleted, shown in the confirmation prompt.' },
          confirmed:   { type: 'boolean', description: 'Set to false for the initial confirmation request. Set to true ONLY after the user has explicitly confirmed.' },
        },
        required: ['schema_id', 'record_id', 'confirmed'],
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS ANALYTICS TOOLS  — pre-computed summaries (zero raw-record noise)
// ─────────────────────────────────────────────────────────────────────────────

const BUSINESS_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_dashboard_summary',
      description: 'Get a complete high-level business overview: total clients, revenue collected, outstanding, net profit, lead pipeline value, active projects, task counts. Use this for general business health questions like "How is my business?", "Give me a dashboard overview", "What are my key metrics?".',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_revenue_summary',
      description: 'Get revenue analytics: total contract value, total collected, outstanding balance, top clients by revenue, and income type breakdown (recurring vs one-time). Use for questions about income, revenue, earnings, payments received.',
      parameters: {
        type: 'object',
        properties: {
          top_n: { type: 'number', description: 'Number of top clients to include. Default 5.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_expense_summary',
      description: 'Get expense analytics: total spend, breakdown by category, top expense categories, and recent expenses. Use for questions about costs, spending, expenses, burn rate.',
      parameters: {
        type: 'object',
        properties: {
          top_n: { type: 'number', description: 'Number of recent expenses to list. Default 5.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_profit_summary',
      description: 'Get profit analytics: total revenue collected, total expenses, net profit, profit margin %. Use for questions about profit, margins, net income, how much money is left.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_client_summary',
      description: 'Get client analytics: total count, active vs inactive, top clients by contract value and amount paid, clients with outstanding balances, recently added clients. Use for questions about clients, customers, accounts.',
      parameters: {
        type: 'object',
        properties: {
          top_n: { type: 'number', description: 'Number of top clients to return. Default 5.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lead_summary',
      description: 'Get lead/pipeline analytics: total leads, weighted pipeline value, leads by stage (new/negotiation/won), top leads by value, conversion insights. Use for questions about leads, pipeline, prospects, sales.',
      parameters: {
        type: 'object',
        properties: {
          top_n: { type: 'number', description: 'Number of top leads to return. Default 5.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_project_summary',
      description: 'Get project analytics: total projects, status breakdown (planning/in-progress/completed/on-hold), average progress %, budget vs spent analysis, over-budget projects, top projects by budget. Use for questions about projects, deliverables, work status.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_task_summary',
      description: 'Get task analytics: total tasks, status breakdown (todo/in-progress/review/completed), priority breakdown (low/medium/high/urgent), tasks per assignee. Use for questions about tasks, workload, to-do items, team capacity.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

/** All tools exposed to the AI — business tools listed first so the AI prefers them for analytics. */
const ALL_TOOLS = [...BUSINESS_TOOLS, ...CRUD_TOOLS];

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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ANALYTICS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Groups an array of objects by the value of a string key. */
function groupBy<T extends Record<string, any>>(arr: T[], key: string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key] ?? 'unknown');
    (acc[k] = acc[k] ?? []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/** Sums a numeric field across an array, safely coercing to 0. */
function sumField<T extends Record<string, any>>(arr: T[], field: string): number {
  return arr.reduce((s, item) => s + (Number(item[field]) || 0), 0);
}

/** Rounds a number to 2 decimal places (for currency/percentage display). */
const r2 = (n: number) => Math.round(n * 100) / 100;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

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
// ──────────────────────────────�      // ── insert_record ────────────────────────────────────────────────────
      case 'insert_record': {
        const { schema_id, record } = args;
        if (!schema_id || typeof schema_id !== 'string') {
          return { error: 'schema_id is required and must be a string.' };
        }
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
          return { error: 'record must be a non-null JSON object.' };
        }

        // ── Validation ──────────────────────────────────────────────────────
        if (schema_id.startsWith('native_')) {
          const tableName  = schema_id.replace('native_', '');
          const validError = validateRecord(tableName, record, 'insert');
          if (validError) return { error: validError };
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
          if (error) {
            // Surface the Postgres constraint message directly so the AI can report it
            return { error: `Insert failed: ${error.message}` };
          }
          log.info(`Inserted 1 record into ${tableName}`);
          return {
            success: true,
            message: `Successfully created record in ${tableName}.`,
            data,
            mutatedTable: tableName,
          };
        }

        const { data, error } = await supabase
          .from('dynamic_records')
          .insert([{ schema_id, data: recordToInsert }])ta, error } = await supabase
          .from('dynamic_schemas')
          .select('id, name, slug');

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = table empty; anything else is worth logging
          log.warn('dynamic_schemas fetch error (non-fatal)', { code: error.code, msg: error.message });
        }

        return { schemas: [...NATIVE_SCHEMAS, ...(d      // ── update_record ────────────────────────────────────────────────────
      case 'update_record': {
        const { schema_id, record_id, updates } = args;
        if (!schema_id  || typeof schema_id  !== 'string') return { error: 'schema_id is required.'  };
        if (!record_id  || typeof record_id  !== 'string') return { error: 'record_id is required.'  };
        if (!updates    || typeof updates    !== 'object' || Array.isArray(updates)) {
          return { error: 'updates must be a non-null JSON object.' };
        }
        if (Object.keys(updates).length === 0) {
          return { error: 'updates object is empty — nothing to update.' };
        }

        if (schema_id.startsWith('native_')) {
          const tableName  = schema_id.replace('native_', '');
          const validError = validateRecord(tableName, updates, 'update');
          if (validError) return { error: validError };

          // Verify the record exists before attempting the update
          const { data: existing, error: findErr } = await supabase
            .from(tableName)
            .select('id')
            .eq('id', record_id)
            .maybeSingle();
          if (findErr) throw findErr;
          if (!existing) {
            return { error: `Record with id "${record_id}" not found in ${tableName}. Cannot update a record that does not exist.` };
          }

          const { data, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', record_id)
            .select();
          if (error) return { error: `Update failed: ${error.message}` };
          if (!data || data.length === 0) {
            return { error: `Update had no effect for record "${record_id}" in ${tableName}.` };
          }
          log.info(`Updated record ${record_id} in ${tableName}`);
          return {
            success: true,
            message: `Successfully updated record in ${tableName}.`,
            data,
            mutatedTable: tableName,
          };
        }

        const { data, error } = await supabase
          .from('dynamic_records')
          .update({ data: updates })
          .eq('id', record_id)
          .select();
        if (error) return { error: `Update failed: ${error.message}` };
        return { success: true, data, mutatedTable: 'dynamic_records' };
      }mi      // ── delete_record ────────────────────────────────────────────────────
      case 'delete_record': {
        const { schema_id, record_id, record_name, confirmed } = args;
        if (!schema_id || typeof schema_id !== 'string') return { error: 'schema_id is required.' };
        if (!record_id || typeof record_id !== 'string') return { error: 'record_id is required.' };

        // ── Two-phase confirmation gate ─────────────────────────────────────
        // Phase 1: Return a confirmation prompt (confirmed=false).
        // The AI shows this message to the user. The user must explicitly agree.
        // Phase 2: Execute the delete only after confirmed=true.
        if (!confirmed) {
          const displayName = record_name
            ? `"${record_name}"`
            : `the record with ID ${record_id}`;
          return {
            requiresConfirmation: true,
            confirmationPrompt:   `⚠️ **Confirmation required**: You are about to permanently delete ${displayName}. **This action cannot be undone.** Please reply with “yes, delete it” or “confirm” to proceed, or “cancel” to abort.`,
          };
        }

        // Phase 2: Confirmed — proceed with deletion
        if (schema_id.startsWith('native_')) {
          const tableName = schema_id.replace('native_', '');

          // Verify the record still exists before deleting
          const { data: existing, error: findErr } = await supabase
            .from(tableName)
            .select('id')
            .eq('id', record_id)
            .maybeSingle();
          if (findErr) throw findErr;
          if (!existing) {
            return { error: `Record with id "${record_id}" not found in ${tableName}. It may have already been deleted.` };
          }

          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', record_id);
          if (error) return { error: `Delete failed: ${error.message}` };

          log.info(`Deleted record ${record_id} from ${tableName}`);
          return {
            success: true,
            message: `Successfully deleted ${record_name ? `"${record_name}"` : 'the record'} from ${tableName}.`,
            mutatedTable: tableName,
          };
        }

        const { error } = await supabase
          .from('dynamic_records')
          .delete()
          .eq('id', record_id);
        if (error) return { error: `Delete failed: ${error.message}` };
        return {
          success: true,
          message: 'Successfully deleted the record.',
          mutatedTable: 'dynamic_records',
        };
      }  .limit(limit);

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

      // ─────────────────────────────────────────────────────────────────────
      // BUSINESS ANALYTICS TOOLS
      // ─────────────────────────────────────────────────────────────────────

      // ── get_dashboard_summary ─────────────────────────────────────────────
      case 'get_dashboard_summary': {
        const [
          { data: clients },
          { data: leads },
          { data: projects },
          { data: tasks },
          { data: expenses },
        ] = await Promise.all([
          supabase.from('clients').select('status, totalValue, amountPaid'),
          supabase.from('leads').select('stage, value, probability'),
          supabase.from('projects').select('status, budget, spent, progress'),
          supabase.from('tasks').select('status, priority'),
          supabase.from('expenses').select('amount'),
        ]);

        const c  = clients  ?? [];
        const l  = leads    ?? [];
        const p  = projects ?? [];
        const t  = tasks    ?? [];
        const ex = expenses ?? [];

        const totalContractValue = sumField(c, 'totalValue');
        const totalCollected     = sumField(c, 'amountPaid');
        const totalExpenses      = sumField(ex, 'amount');
        const netProfit          = totalCollected - totalExpenses;
        const pipelineValue      = l.reduce((s, lead) =>
          s + (Number(lead.value) || 0) * (Number(lead.probability) || 0) / 100, 0);

        const clientStatus  = groupBy(c, 'status');
        const projectStatus = groupBy(p, 'status');
        const taskStatus    = groupBy(t, 'status');

        return {
          clients: {
            total:    c.length,
            active:   (clientStatus['active']   ?? []).length,
            inactive: (clientStatus['inactive'] ?? []).length,
          },
          revenue: {
            totalContractValue: r2(totalContractValue),
            collected:          r2(totalCollected),
            outstanding:        r2(totalContractValue - totalCollected),
          },
          expenses:  { total: r2(totalExpenses) },
          profit: {
            net:    r2(netProfit),
            margin: totalCollected > 0 ? r2((netProfit / totalCollected) * 100) : 0,
          },
          leads: {
            total:         l.length,
            won:           (groupBy(l, 'stage')['won'] ?? []).length,
            pipelineValue: r2(pipelineValue),
          },
          projects: {
            total:       p.length,
            inProgress:  (projectStatus['in-progress'] ?? []).length,
            completed:   (projectStatus['completed']   ?? []).length,
            planning:    (projectStatus['planning']    ?? []).length,
            onHold:      (projectStatus['on-hold']     ?? []).length,
          },
          tasks: {
            total:      t.length,
            todo:       (taskStatus['todo']         ?? []).length,
            inProgress: (taskStatus['in-progress']  ?? []).length,
            inReview:   (taskStatus['review']       ?? []).length,
            completed:  (taskStatus['completed']    ?? []).length,
          },
        };
      }

      // ── get_revenue_summary ───────────────────────────────────────────────
      case 'get_revenue_summary': {
        const topN = Math.max(1, Math.min(Number(args.top_n) || 5, 20));

        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, company, status, totalValue, amountPaid, incomeType');

        const c = clients ?? [];
        const totalContract  = sumField(c, 'totalValue');
        const totalCollected = sumField(c, 'amountPaid');
        const outstanding    = totalContract - totalCollected;

        const byIncomeType = groupBy(c, 'incomeType');
        const incomeBreakdown = Object.entries(byIncomeType).map(([type, rows]) => ({
          type,
          clients:   rows.length,
          revenue:   r2(sumField(rows, 'totalValue')),
          collected: r2(sumField(rows, 'amountPaid')),
        }));

        const topClients = [...c]
          .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
          .slice(0, topN)
          .map(cl => ({
            name:      cl.name || cl.company,
            status:    cl.status,
            contract:  r2(cl.totalValue   || 0),
            collected: r2(cl.amountPaid   || 0),
            outstanding: r2((cl.totalValue || 0) - (cl.amountPaid || 0)),
          }));

        return {
          summary: {
            totalContractValue: r2(totalContract),
            totalCollected:     r2(totalCollected),
            totalOutstanding:   r2(outstanding),
            collectionRate:     totalContract > 0 ? r2((totalCollected / totalContract) * 100) : 0,
          },
          incomeBreakdown,
          topClientsByRevenue: topClients,
        };
      }

      // ── get_expense_summary ───────────────────────────────────────────────
      case 'get_expense_summary': {
        const topN = Math.max(1, Math.min(Number(args.top_n) || 5, 20));

        const { data: expenses } = await supabase
          .from('expenses')
          .select('id, description, category, amount, date')
          .order('date', { ascending: false });

        const ex = expenses ?? [];
        const total = sumField(ex, 'amount');

        const byCategory = groupBy(ex, 'category');
        const categoryBreakdown = Object.entries(byCategory)
          .map(([cat, rows]) => ({
            category:   cat,
            count:      rows.length,
            total:      r2(sumField(rows, 'amount')),
            percentage: total > 0 ? r2((sumField(rows, 'amount') / total) * 100) : 0,
          }))
          .sort((a, b) => b.total - a.total);

        const recent = ex.slice(0, topN).map(e => ({
          description: e.description,
          category:    e.category,
          amount:      r2(e.amount || 0),
          date:        e.date,
        }));

        return {
          summary: { total: r2(total), count: ex.length },
          byCategory: categoryBreakdown,
          recentExpenses: recent,
        };
      }

      // ── get_profit_summary ────────────────────────────────────────────────
      case 'get_profit_summary': {
        const [{ data: clients }, { data: expenses }] = await Promise.all([
          supabase.from('clients').select('amountPaid'),
          supabase.from('expenses').select('amount'),
        ]);

        const totalRevenue  = sumField(clients  ?? [], 'amountPaid');
        const totalExpenses = sumField(expenses ?? [], 'amount');
        const netProfit     = totalRevenue - totalExpenses;
        const margin        = totalRevenue > 0 ? r2((netProfit / totalRevenue) * 100) : 0;

        // Monthly breakdown from financial_metrics chart table if available
        const { data: monthly } = await supabase
          .from('financial_metrics')
          .select('month, revenue, expenses, profit')
          .order('orderIndex');

        return {
          summary: {
            totalRevenue:  r2(totalRevenue),
            totalExpenses: r2(totalExpenses),
            netProfit:     r2(netProfit),
            profitMargin:  margin,
            status:        netProfit >= 0 ? 'profitable' : 'loss',
          },
          monthlyTrend: (monthly ?? []).map(m => ({
            month:    m.month,
            revenue:  r2(m.revenue  || 0),
            expenses: r2(m.expenses || 0),
            profit:   r2(m.profit   || 0),
          })),
        };
      }

      // ── get_client_summary ────────────────────────────────────────────────
      case 'get_client_summary': {
        const topN = Math.max(1, Math.min(Number(args.top_n) || 5, 20));

        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, company, status, totalValue, amountPaid, incomeType, joinedDate')
          .order('joinedDate', { ascending: false });

        const c = clients ?? [];
        const byStatus = groupBy(c, 'status');

        const withOutstanding = c.filter(cl => (cl.totalValue || 0) > (cl.amountPaid || 0));

        const topByValue = [...c]
          .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
          .slice(0, topN)
          .map(cl => ({
            name:        cl.name || cl.company,
            status:      cl.status,
            totalValue:  r2(cl.totalValue  || 0),
            amountPaid:  r2(cl.amountPaid  || 0),
            outstanding: r2((cl.totalValue || 0) - (cl.amountPaid || 0)),
            incomeType:  cl.incomeType,
          }));

        const recentlyAdded = c.slice(0, topN).map(cl => ({
          name:       cl.name || cl.company,
          status:     cl.status,
          joinedDate: cl.joinedDate,
        }));

        return {
          summary: {
            total:           c.length,
            active:          (byStatus['active']   ?? []).length,
            inactive:        (byStatus['inactive'] ?? []).length,
            withOutstanding: withOutstanding.length,
          },
          topClientsByValue: topByValue,
          recentlyAdded,
        };
      }

      // ── get_lead_summary ──────────────────────────────────────────────────
      case 'get_lead_summary': {
        const topN = Math.max(1, Math.min(Number(args.top_n) || 5, 20));

        const { data: leads } = await supabase
          .from('leads')
          .select('id, name, company, stage, value, probability, source');

        const l = leads ?? [];
        const byStage = groupBy(l, 'stage');

        // Weighted pipeline: sum of (value * probability / 100)
        const weightedPipeline = l.reduce(
          (s, lead) => s + (Number(lead.value) || 0) * (Number(lead.probability) || 0) / 100, 0);
        const totalPipelineValue = sumField(l, 'value');

        const stageBreakdown = Object.entries(byStage).map(([stage, rows]) => ({
          stage,
          count: rows.length,
          value: r2(sumField(rows, 'value')),
        }));

        const topLeads = [...l]
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .slice(0, topN)
          .map(lead => ({
            name:        lead.name || lead.company,
            company:     lead.company,
            stage:       lead.stage,
            value:       r2(lead.value || 0),
            probability: lead.probability,
            source:      lead.source,
          }));

        const bySource = groupBy(l, 'source');
        const sourceBreakdown = Object.entries(bySource)
          .map(([source, rows]) => ({ source, count: rows.length }))
          .sort((a, b) => b.count - a.count);

        return {
          summary: {
            total:               l.length,
            won:                 (byStage['won']         ?? []).length,
            inNegotiation:       (byStage['negotiation'] ?? []).length,
            new:                 (byStage['new']         ?? []).length,
            totalPipelineValue:  r2(totalPipelineValue),
            weightedPipeline:    r2(weightedPipeline),
          },
          stageBreakdown,
          sourceBreakdown,
          topLeadsByValue: topLeads,
        };
      }

      // ── get_project_summary ───────────────────────────────────────────────
      case 'get_project_summary': {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, client, status, progress, budget, spent, priority');

        const p = projects ?? [];
        const byStatus   = groupBy(p, 'status');
        const byPriority = groupBy(p, 'priority');

        const totalBudget = sumField(p, 'budget');
        const totalSpent  = sumField(p, 'spent');
        const avgProgress = p.length > 0
          ? r2(p.reduce((s, proj) => s + (Number(proj.progress) || 0), 0) / p.length)
          : 0;

        const overBudget = p.filter(proj => (proj.spent || 0) > (proj.budget || 0));

        const topByBudget = [...p]
          .sort((a, b) => (b.budget || 0) - (a.budget || 0))
          .slice(0, 5)
          .map(proj => ({
            name:       proj.name,
            client:     proj.client,
            status:     proj.status,
            progress:   proj.progress,
            budget:     r2(proj.budget || 0),
            spent:      r2(proj.spent  || 0),
            remaining:  r2((proj.budget || 0) - (proj.spent || 0)),
            overBudget: (proj.spent || 0) > (proj.budget || 0),
          }));

        return {
          summary: {
            total:       p.length,
            inProgress:  (byStatus['in-progress'] ?? []).length,
            completed:   (byStatus['completed']   ?? []).length,
            planning:    (byStatus['planning']    ?? []).length,
            onHold:      (byStatus['on-hold']     ?? []).length,
            avgProgress,
            totalBudget: r2(totalBudget),
            totalSpent:  r2(totalSpent),
            overBudgetCount: overBudget.length,
          },
          priorityBreakdown: Object.entries(byPriority).map(([priority, rows]) => ({
            priority, count: rows.length,
          })),
          topProjectsByBudget: topByBudget,
          overBudgetProjects: overBudget.map(proj => ({
            name:    proj.name,
            client:  proj.client,
            budget:  r2(proj.budget || 0),
            spent:   r2(proj.spent  || 0),
            overrun: r2((proj.spent || 0) - (proj.budget || 0)),
          })),
        };
      }

      // ── get_task_summary ──────────────────────────────────────────────────
      case 'get_task_summary': {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, project, assignee, status, priority');

        const t = tasks ?? [];
        const byStatus   = groupBy(t, 'status');
        const byPriority = groupBy(t, 'priority');
        const byAssignee = groupBy(t, 'assignee');

        const assigneeWorkload = Object.entries(byAssignee)
          .map(([assignee, rows]) => ({
            assignee,
            total:      rows.length,
            inProgress: rows.filter(r => r.status === 'in-progress').length,
            completed:  rows.filter(r => r.status === 'completed').length,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        const urgentPending = t.filter(
          task => task.priority === 'urgent' && task.status !== 'completed'
        ).map(task => ({ title: task.title, project: task.project, assignee: task.assignee }));

        return {
          summary: {
            total:      t.length,
            todo:       (byStatus['todo']        ?? []).length,
            inProgress: (byStatus['in-progress'] ?? []).length,
            inReview:   (byStatus['review']      ?? []).length,
            completed:  (byStatus['completed']   ?? []).length,
          },
          priorityBreakdown: Object.entries(byPriority).map(([priority, rows]) => ({
            priority, count: rows.length,
          })),
          assigneeWorkload,
          urgentPendingTasks: urgentPending,
        };
      }

      // ── unknown tool ──────────────────────────────────────────────────────
      default:
        log.warn(`Unknown tool called: "${name}"`);
        return {
          error: `Unknown tool "${name}". Available tools: get_dashboard_summary, get_revenue_summary, get_expense_summary, get_profit_summary, get_client_summary, get_lead_summary, get_project_summary, get_task_summary, list_schemas, get_schema_fields, search_records, insert_record, update_record, delete_record`,
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

const SYSTEM_PROMPT = `You are duo-AI, a Tony Stark JARVIS-like business intelligence assistant deeply integrated into the DuoKarma admin dashboard. You are sharp, professional, and slightly witty. You have live access to all business data.

## Conversational Turn
If the user greets you or asks a casual question, respond naturally in JARVIS style. Do NOT call tools.

## Business Analytics Questions (PREFERRED PATH)
For ANY business question — revenue, profit, expenses, clients, leads, projects, tasks — use the dedicated analytics tools FIRST. These return pre-computed, structured data and are far more efficient than raw record fetches:

| Question type                        | Tool to call              |
|--------------------------------------|---------------------------|
| Dashboard overview / business health | get_dashboard_summary     |
| Revenue, income, earnings, payments  | get_revenue_summary       |
| Expenses, costs, spending, burn rate | get_expense_summary       |
| Profit, margins, net income          | get_profit_summary        |
| Clients, customers, accounts         | get_client_summary        |
| Leads, pipeline, prospects, sales    | get_lead_summary          |
| Projects, deliverables, work status  | get_project_summary       |
| Tasks, workload, to-do, team load    | get_task_summary          |

Present analytics results in a clear, executive-style summary. Use bullet points or a table when comparing data. Always highlight the most important insight.

## Specific Record Lookup (use raw CRUD tools only when targeting a specific named record)
If the user asks about a specific named entity (e.g. "Tell me about Hatim's project", "What is the status of Project Alpha?"):
1. Call \`list_schemas\` → get schema_id.
2. Call \`search_records\` with a search_term to find that specific record.
3. Report precisely what you find.

## Write Operations (ADD / UPDATE / DELETE)
If the user wants to create, modify, or delete something:

**INSERT:**
1. Call `list_schemas` → get schema_id.
2. Call `get_schema_fields` → get exact column names.
3. Call `insert_record`. If the tool returns a validation error, report it to the user and ask for correction. Never proceed with invalid data.

**UPDATE:**
1. Call `list_schemas` → get schema_id.
2. Call `get_schema_fields` → get exact column names.
3. Call `search_records` to find the exact `id` of the target record.
4. Call `update_record`. Report any validation errors verbatim.

**DELETE — MANDATORY TWO-STEP PROCESS:**
1. Call `list_schemas` + `search_records` to find the exact `id` and name of the target record.
2. Call `delete_record` with `confirmed: false` first. Show the `confirmationPrompt` from the response to the user verbatim.
3. Wait for the user to explicitly say “yes”, “confirm”, or equivalent.
4. Only then call `delete_record` again with `confirmed: true`.
5. If the user says “no”, “cancel”, or similar, abort — do NOT call delete again.

Rule: If any tool returns an `error` field, report the exact error message to the user. Never claim success unless `success: true` is in the response.

## Response Style
- Lead with the answer, not the process.
- Format currency as ₹X or ₹X,XXX.
- Use percentages for rates and margins.
- Be concise. Executives want the insight, not the raw numbers dump.`;


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
      tools:       ALL_TOOLS,
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
