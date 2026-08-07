/**
 * ai-context.ts — Lightweight AI Working Memory
 *
 * Architecture Overview:
 * ─────────────────────
 * This module maintains a small, in-memory "working memory" for the AI
 * assistant. It tracks three dimensions of context:
 *
 *   1. Current Page       — derived from window.location.pathname (free).
 *   2. Focused Entity     — the most recently discussed record (client, lead, etc.)
 *   3. Recent Records     — up to MAX_RECENT_RECORDS records touched this session.
 *
 * The context is compiled into a compact text block (~30-80 tokens) and
 * prepended to the system message on every request. This costs virtually
 * nothing token-wise but gives the AI immediate access to conversational state
 * without relying on long message histories.
 *
 * Context is populated from two sources:
 *   • Tool result hints returned by api/ai.ts (_context.touchedRecords)
 *   • URL path (read directly from window.location at send time)
 *
 * The state is a simple module-level singleton — no React, no persistence,
 * intentionally ephemeral per browser session.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A reference to a single database record that the AI has worked with. */
export interface EntityRef {
  id:    string;
  /** Human-readable name (e.g. "Hatim", "Project Alpha"). */
  name:  string;
  /** The native table name without the `native_` prefix (e.g. "clients"). */
  table: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum number of recent records to track. Older entries are evicted. */
const MAX_RECENT_RECORDS = 5;

/**
 * Maps URL path segments to friendly labels shown in the context block.
 * Add entries here if new dashboard pages are created.
 */
const PATH_LABELS: Record<string, string> = {
  dashboard:  'Main Dashboard',
  clients:    'Clients',
  leads:      'Leads',
  projects:   'Projects',
  tasks:      'Tasks',
  expenses:   'Expenses',
  documents:  'Documents',
  analytics:  'Analytics',
  revenue:    'Revenue',
  profit:     'Profit',
  reports:    'Reports',
  calendar:   'Calendar',
};

// ─────────────────────────────────────────────────────────────────────────────
// Module-level State (singleton — intentionally not exported)
// ─────────────────────────────────────────────────────────────────────────────

interface State {
  /** The entity currently "in focus" — set to the most recently touched record. */
  focusedEntity: EntityRef | null;
  /** Ring buffer of recently touched records, newest first. */
  recentRecords: EntityRef[];
}

let _state: State = {
  focusedEntity: null,
  recentRecords: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates the working memory using the `_context` payload returned by api/ai.ts.
 *
 * Called after every successful AI response.
 * The first record in `touchedRecords` becomes the new focused entity.
 * Records are deduplicated by `id` and the ring buffer is kept at MAX_RECENT_RECORDS.
 */
export function updateContext(touchedRecords: EntityRef[] = []): void {
  if (touchedRecords.length === 0) return;

  // First record is considered the primary / focused entity for this turn
  _state.focusedEntity = touchedRecords[0];

  // Merge into recent records: remove any existing entry with the same id,
  // prepend the new entry, then cap the list.
  for (const rec of touchedRecords) {
    _state.recentRecords = [
      rec,
      ..._state.recentRecords.filter((r) => r.id !== rec.id),
    ].slice(0, MAX_RECENT_RECORDS);
  }
}

/**
 * Builds a compact context string (~30-80 tokens) suitable for prepending
 * to the server-side system prompt.
 *
 * Returns an empty string if there is no context to report (first message).
 *
 * Example output:
 * ```
 * [CONTEXT]
 * Current page: Clients
 * Current focus: Hatim (client, id: abc123)
 * Recently discussed: Hatim (client, id: abc123), Project Alpha (project, id: xyz789)
 * [/CONTEXT]
 * ```
 *
 * @param pathname — pass `window.location.pathname` from the frontend.
 */
export function buildContextBlock(pathname: string): string {
  const parts: string[] = [];

  // ── Page ───────────────────────────────────────────────────────────────
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  const pageLabel   = PATH_LABELS[lastSegment];
  if (pageLabel) {
    parts.push(`Current page: ${pageLabel}`);
  }

  // ── Focused entity ─────────────────────────────────────────────────────
  if (_state.focusedEntity) {
    const { name, table, id } = _state.focusedEntity;
    // table is e.g. "clients" — drop the trailing 's' for readability
    const entityType = table.replace(/s$/, '');
    parts.push(`Current focus: ${name} (${entityType}, id: ${id})`);
  }

  // ── Recent records ─────────────────────────────────────────────────────
  if (_state.recentRecords.length > 0) {
    const list = _state.recentRecords
      .map(({ name, table, id }) => `${name} (${table.replace(/s$/, '')}, id: ${id})`)
      .join(', ');
    parts.push(`Recently discussed: ${list}`);
  }

  if (parts.length === 0) return '';

  return `[CONTEXT]\n${parts.join('\n')}\n[/CONTEXT]\n\n`;
}

/**
 * Clears all working memory.
 * Call this on logout or when starting a completely new conversation topic.
 */
export function resetContext(): void {
  _state = { focusedEntity: null, recentRecords: [] };
}

/** Returns a read-only snapshot of the current state (for debugging). */
export function getContextSnapshot(): Readonly<State> {
  return { ..._state, recentRecords: [..._state.recentRecords] };
}
