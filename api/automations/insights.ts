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

  // 3. Call LLM (using GROQ or GEMINI)
  let insightText = '';
  try {
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (groqKey) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });
      if (groqRes.ok) {
        const json = await groqRes.json();
        insightText = json.choices?.[0]?.message?.content || '';
      }
    }

    if (!insightText) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("No AI provider key found (GROQ_API_KEY or GEMINI_API_KEY)");
      
      // We use the Gemini API endpoint as fallback
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
    }
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
