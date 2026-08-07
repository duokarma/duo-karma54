import { SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export type TriggerType = 'schedule' | 'event';

export interface AutomationTrigger {
  type: TriggerType;
  /** For 'schedule', this is a cron expression or identifier (e.g. 'daily', 'weekly'). For 'event', it is the webhook event name (e.g. 'invoice.created'). */
  value: string;
}

/**
 * A condition evaluates whether an automation should execute.
 * @returns true if the action should proceed.
 */
export type AutomationCondition = (
  supabase: SupabaseClient,
  payload?: any
) => Promise<boolean>;

/**
 * An action performs the actual side-effect.
 */
export type AutomationAction = (
  supabase: SupabaseClient,
  payload?: any
) => Promise<void>;

export interface AutomationJob {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  condition?: AutomationCondition;
  action: AutomationAction;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE RUNNER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs a specific job if its condition passes.
 */
export async function runJob(job: AutomationJob, supabase: SupabaseClient, payload?: any): Promise<boolean> {
  try {
    if (job.condition) {
      const shouldRun = await job.condition(supabase, payload);
      if (!shouldRun) return false;
    }
    
    await job.action(supabase, payload);
    return true;
  } catch (error) {
    console.error(`Automation Engine Error [Job: ${job.id}]:`, error);
    return false;
  }
}
