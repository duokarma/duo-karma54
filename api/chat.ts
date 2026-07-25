import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_INSTRUCTION = `You are DuoKarma Assistant, an expert AI business consultant for DuoKarma Business Hub.
DuoKarma specializes in building custom digital solutions, high-converting websites, admin management software, automated booking systems, CRM systems, and AI workflows for businesses (Salons, Medical Clinics, Gyms, Restaurants, Farmhouses, and Service Enterprises).

Your Objectives:
1. Warmly greet users and act as a knowledgeable, friendly software consultant.
2. Ask about their business type, goals, key operational challenges, or features they are looking for.
3. Recommend tailored digital solutions (e.g. for Salons: appointment booking + staff management + billing; for Clinics: patient records + secure billing + reminders).
4. Provide estimated project timelines (e.g. 1-3 weeks for standard systems, 3-6 weeks for enterprise platforms).
5. Gently encourage them to book a free 20-min strategy call or request a custom proposal.

Guidelines:
- Keep responses clear, professional, concise, and structured with clean formatting or short bullet points.
- Be helpful and energetic. Avoid overly verbose explanations.`;

export default async function handler(req: any, res: any) {
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
    }

    const { messages = [] } = req.body || {};

    // Standardize contents array for Gemini API
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Fallback to gemini-1.5-flash if 2.5-flash model name varies by region
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
      });

      if (!fallbackRes.ok) {
        const fallbackErr = await fallbackRes.text();
        return res.status(fallbackRes.status).json({ error: fallbackErr || errorText });
      }

      const fallbackData = await fallbackRes.json();
      const text = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      return res.status(200).json({ text });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
