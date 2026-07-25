import { GoogleGenAI } from '@google/genai';

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

// Only use models confirmed to exist in the v1beta API
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const RATE_LIMIT_MESSAGE =
  "I'm getting a lot of questions right now and need a short breather! 🙂 Please try again in **30–60 seconds** — I'll be right back.\n\nIn the meantime, feel free to **book a strategy call** or **send us a WhatsApp message** using the buttons on the right!";

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

    const ai = new GoogleGenAI({ apiKey });
    const { messages = [] } = req.body || {};

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    let text = '';
    let success = false;
    let isRateLimit = false;

    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        });
        if (response.text) {
          text = response.text;
          success = true;
          break;
        }
      } catch (err: any) {
        const msg = err.message || String(err);
        // Detect rate limit / quota exhaustion — return friendly message instead of raw error
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          isRateLimit = true;
          // Don't break — try next model
        }
        // If model doesn't exist (404 / NOT_FOUND), skip silently
      }
    }

    if (success) {
      return res.status(200).json({ text });
    } else if (isRateLimit) {
      // Return 200 with friendly message so the UI shows it as a chat message
      return res.status(200).json({ text: RATE_LIMIT_MESSAGE });
    } else {
      return res.status(200).json({ text: "Sorry, I'm having trouble connecting right now. Please try again in a moment or reach us via WhatsApp!" });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({ text: "Something went wrong on my end. Please try again shortly!" });
  }
}
