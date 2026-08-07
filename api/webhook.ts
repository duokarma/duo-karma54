import { createClient } from '@supabase/supabase-js';
import { JOB_REGISTRY } from './automations/registry';
import { runJob } from './automations/engine';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Supabase Webhooks typically send POST requests with the event payload
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // A real webhook handler should verify the signature or a secret header
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const authHeader = req.headers.authorization;
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return res.status(401).json({ error: 'Unauthorized webhook request.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const payload = req.body;
  // Supabase Webhook payload example: { type: 'INSERT', table: 'invoices', record: {...} }
  if (!payload || !payload.type || !payload.table) {
    return res.status(400).json({ error: 'Invalid webhook payload structure.' });
  }

  // Construct the event name from the payload (e.g., 'invoice.created' from table 'invoices' and type 'INSERT')
  const actionMap: Record<string, string> = { 'INSERT': 'created', 'UPDATE': 'updated', 'DELETE': 'deleted' };
  const eventAction = actionMap[payload.type] || payload.type.toLowerCase();
  
  // E.g., 'invoices' -> 'invoice'
  const entity = payload.table.endsWith('s') ? payload.table.slice(0, -1) : payload.table;
  const eventName = `${entity}.${eventAction}`;

  const eventJobs = JOB_REGISTRY.filter(job => 
    job.trigger.type === 'event' && job.trigger.value === eventName
  );

  const results = [];
  for (const job of eventJobs) {
    const executed = await runJob(job, supabase, payload);
    results.push({ job: job.id, executed });
  }

  return res.status(200).json({ success: true, event: eventName, results });
}
