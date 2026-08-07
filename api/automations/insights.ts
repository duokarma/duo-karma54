import { AutomationAction } from './engine';

export const generateProactiveInsights: AutomationAction = async (supabase) => {
  // 1. Gather Data
  const [revenueRes, leadsRes, projectsRes] = await Promise.all([
    supabase.from('financial_metrics').select('*').order('month', { ascending: false }).limit(2),
    supabase.from('leads').select('*').eq('stage', 'Negotiation'),
    supabase.from('projects').select('*').in('status', ['At Risk', 'Delayed'])
  ]);

  const recentRevenue = revenueRes.data?.[0]?.revenue || 0;
  const previousRevenue = revenueRes.data?.[1]?.revenue || 0;
  const revenueTrend = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  const negotiationLeadsCount = leadsRes.data?.length || 0;
  const atRiskProjectsCount = projectsRes.data?.length || 0;

  // 2. Construct Prompt
  const prompt = `
You are the DuoKarma proactive AI insights engine.
Analyze the following business metrics and generate a short, actionable, 1-2 sentence proactive insight.
Metrics:
- Revenue trend: ${revenueTrend.toFixed(1)}% compared to last period. (Recent: $${recentRevenue})
- Leads in Negotiation: ${negotiationLeadsCount}
- Projects At Risk / Delayed: ${atRiskProjectsCount}

Example: "Revenue is down 10% this week. Consider following up with the 3 leads currently in Negotiation."
Example: "Project X is at risk of being delayed. Do you want me to message the team?"

Do not include any pleasantries or intro text. Just the insight.
  `.trim();

  // 3. Call LLM (using GEMINI or GROQ)
  let insightText = '';
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");
    
    // We use the Gemini API endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`LLM Error: ${response.statusText}`);
    }

    const json = await response.json();
    insightText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error("Proactive Insights Generation Failed:", error);
    // Fallback static insight
    insightText = `Automated Insight: You have ${atRiskProjectsCount} projects at risk and ${negotiationLeadsCount} leads in negotiation.`;
  }

  // 4. Save Insight
  const id = typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function' 
    ? (crypto as any).randomUUID() 
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  await supabase.from('activities').insert([{
    id,
    type: 'insight',
    message: insightText.trim(),
    actor: 'AI Insights Engine',
    timestamp: new Date().toISOString()
  }]);
};
