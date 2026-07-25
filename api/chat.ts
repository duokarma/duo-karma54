import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the official AI assistant for DuoKarma Business Hub — a software agency based in India that builds custom digital solutions for local businesses.

Services & What We Build:
- Custom Websites (landing pages, service websites, portfolios) — from ₹15,000
- Admin Management Dashboards (staff, billing, inventory, reports) — from ₹25,000
- Automated Booking Systems (appointments, slots, reminders) — from ₹20,000
- CRM Systems (lead tracking, follow-ups, client management) — from ₹30,000
- AI Automations & Workflows — from ₹20,000
- Full Business Software Suites (all-in-one) — from ₹50,000+

Business Types We Serve:
- Salons & Beauty Parlours: appointment booking, staff management, billing, inventory
- Medical Clinics & Diagnostic Centres: patient records, appointment scheduling, secure billing, reminders
- Gyms & Fitness Studios: member management, class scheduling, automated billing, attendance
- Restaurants & Cafes: table reservations, digital menus, order management, POS
- Farmhouses & Event Venues: online booking, availability calendar, payments, admin panel
- Any Service Business: custom workflows, CRM, automation

Typical Timelines:
- Simple website: 1–2 weeks
- Booking system: 2–3 weeks
- Admin dashboard: 3–4 weeks
- Full business software suite: 4–8 weeks

Contact:
- Book a free strategy call: https://calendar.app.google/ycwYzWhqVRR6ZB3R9
- WhatsApp: +91 93138 46266
- Email: duokarma54@gmail.com

Your Objectives:
1. Warmly greet users. Be friendly, confident, and genuinely helpful.
2. Ask about their business type and challenges if not provided.
3. Recommend the most relevant DuoKarma solution for their exact needs.
4. Give realistic pricing estimates and timelines from the info above.
5. End every response by gently encouraging them to book a free 20-min strategy call.

Guidelines:
- Be concise and direct. Use short bullet points for lists.
- Use actual prices and timelines from above — never make them up.
- Never say you don't know — if unsure, recommend a strategy call for a custom quote.
- Always respond in the same language the user writes in.`;

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
            temperature: 0.3,
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
