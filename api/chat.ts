const SYSTEM_INSTRUCTION = `You are the DuoKarma AI Assistant — a friendly, knowledgeable assistant for DuoKarma Business Hub, a software agency based in India that builds custom digital solutions for local businesses.

Services & Pricing:
- Custom Websites (landing pages, portfolios) — from ₹15,000 | 1–2 weeks
- Admin Management Dashboards (staff, billing, inventory) — from ₹25,000 | 3–4 weeks
- Automated Booking Systems (appointments, slots, reminders) — from ₹20,000 | 2–3 weeks
- CRM Systems (lead tracking, follow-ups) — from ₹30,000 | 3–4 weeks
- AI Automations & Workflows — from ₹20,000 | 2–3 weeks
- Full Business Software Suites (all-in-one) — from ₹50,000+ | 4–8 weeks

Business Types We Serve:
- Salons & Beauty Parlours: booking, staff, billing, inventory
- Medical Clinics: patient records, appointments, billing, reminders
- Gyms & Fitness Studios: members, class scheduling, automated billing, attendance
- Restaurants & Cafes: table reservations, digital menus, POS
- Farmhouses & Event Venues: booking, availability calendar, payments
- Any Service Business: custom workflows, CRM, automation

Contact:
- Book a free call: https://calendar.app.google/ycwYzWhqVRR6ZB3R9
- WhatsApp: +91 93138 46266
- Email: duokarma54@gmail.com

Rules:
- Be concise, warm, and helpful. Use short bullet points.
- Give realistic pricing from above — never fabricate numbers.
- Always end responses by gently encouraging a free strategy call.
- Respond in the same language the user uses.
- Never say you don't know — recommend a strategy call for custom quotes.`;

const RATE_LIMIT_MESSAGE =
  "I'm getting a lot of messages right now! 🙂 Please try again in **30–60 seconds** — I'll be right back.\n\nIn the meantime, feel free to **book a strategy call** or **WhatsApp us** using the buttons below!";

const PROVIDER_TIMEOUT_MS = 8_000;

/** Fetch with an automatic AbortController timeout */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req: any, res: any) {
  // ── CORS preflight ─────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [] } = req.body || {};

  // Normalise message format for OpenAI-compatible APIs
  const apiMessages = messages.map((m: any) => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content || m.text || '',
  }));

  let isRateLimit = false;

  // ── Provider 1: Groq — LLaMA 3.3 70B (fastest, primary) ──────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log('[chat] Trying Groq...');
      const groqRes = await fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, ...apiMessages],
            temperature: 0.7,
            max_tokens: 900,
          }),
        },
      );
      if (groqRes.ok) {
        const groqData: any = await groqRes.json();
        const text: string | undefined = groqData?.choices?.[0]?.message?.content;
        if (text) {
          console.log('[chat] ✓ Groq responded OK');
          return res.status(200).json({ text });
        }
      } else {
        const errBody = await groqRes.text().catch(() => '');
        console.error(`[chat] Groq HTTP ${groqRes.status}:`, errBody.slice(0, 300));
        if (groqRes.status === 429) isRateLimit = true;
      }
    } catch (err: any) {
      const msg: string = err?.message || String(err);
      console.error('[chat] Groq fetch error:', msg.slice(0, 300));
      if (msg.includes('429') || msg.includes('quota')) isRateLimit = true;
    }
  } else {
    console.warn('[chat] GROQ_API_KEY is not set in Vercel environment variables');
  }

  // ── Provider 2: OpenRouter — Gemma free tier (2nd fallback) ───────────────
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      console.log('[chat] Trying OpenRouter...');
      const orRes = await fetchWithTimeout(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${orKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://duo-karma54.vercel.app',
            'X-Title': 'DuoKarma AI Assistant',
          },
          body: JSON.stringify({
            model: 'google/gemma-3-27b-it:free',
            messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, ...apiMessages],
            max_tokens: 800,
          }),
        },
      );
      if (orRes.ok) {
        const orData: any = await orRes.json();
        const text: string | undefined = orData?.choices?.[0]?.message?.content;
        if (text) {
          console.log('[chat] ✓ OpenRouter responded OK');
          return res.status(200).json({ text });
        }
      } else {
        const errBody = await orRes.text().catch(() => '');
        console.error(`[chat] OpenRouter HTTP ${orRes.status}:`, errBody.slice(0, 300));
        if (orRes.status === 429) isRateLimit = true;
      }
    } catch (err: any) {
      console.error('[chat] OpenRouter fetch error:', String(err).slice(0, 300));
    }
  }

  // ── Provider 3: Google Gemini (3rd fallback) ───────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log('[chat] Trying Gemini...');
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }],
      }));
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const model of geminiModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
              maxOutputTokens: 900,
            },
          });
          if (response.text) {
            console.log(`[chat] ✓ Gemini responded OK (${model})`);
            return res.status(200).json({ text: response.text });
          }
        } catch (modelErr: any) {
          const msg: string = modelErr?.message || String(modelErr);
          console.error(`[chat] Gemini ${model} error:`, msg.slice(0, 300));
          if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
            isRateLimit = true;
          }
        }
      }
    } catch (err: any) {
      console.error('[chat] Gemini init error:', String(err).slice(0, 300));
    }
  } else {
    console.warn('[chat] GEMINI_API_KEY is not set in Vercel environment variables');
  }

  // ── All 3 providers failed ────────────────────────────────────────────────
  if (isRateLimit) {
    return res.status(200).json({ text: RATE_LIMIT_MESSAGE });
  }
  console.error('[chat] All providers failed — check Vercel env vars & API keys');
  return res.status(200).json({
    text: "I'm having a brief moment of downtime. Please try again in **30 seconds** or reach us directly via **WhatsApp** using the button below! 🙂",
  });
}
