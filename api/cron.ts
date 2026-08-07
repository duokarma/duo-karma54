import { createClient } from '@supabase/supabase-js';
import { JOB_REGISTRY } from './automations/registry';
import { runJob } from './automations/engine';

export default async function handler(req: any, res: any) {
  // ── CORS pre-flight ──────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Typically, a cron endpoint should be secured by a secret token to prevent abuse
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized cron request.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
  // Use service role key to bypass RLS since automations are system-level
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // In a real scheduler, the payload might specify the interval ('daily', 'weekly')
  const interval = req.query.interval || 'daily';

  const scheduledJobs = JOB_REGISTRY.filter(job => 
    job.trigger.type === 'schedule' && job.trigger.value === interval
  );

  const results = [];
  for (const job of scheduledJobs) {
    const executed = await runJob(job, supabase);
    results.push({ job: job.id, executed });
  }

  return res.status(200).json({ success: true, interval, results });
}
