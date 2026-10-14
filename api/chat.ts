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

const TIMEOUT_MS = 8_000;

/** Fetch with automatic AbortController timeout */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req: any, res: any) {
  // ── CORS preflight ──────────────────────────────────────────────────────────
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

  const apiMessages = messages.map((m: any) => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content || m.text || '',
  }));

  let isRateLimit = false;

  // ── PRIMARY: Groq — LLaMA 3.3 70B (fastest, most reliable) ────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log('[chat] → Groq (primary)');
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
        const data: any = await groqRes.json();
        const text: string | undefined = data?.choices?.[0]?.message?.content;
        if (text) {
          console.log('[chat] ✓ Groq OK');
          return res.status(200).json({ text });
        }
      } else {
        const body = await groqRes.text().catch(() => '');
        console.error(`[chat] Groq HTTP ${groqRes.status}:`, body.slice(0, 200));
        if (groqRes.status === 429) isRateLimit = true;
      }
    } catch (err: any) {
      const msg = String(err?.message || err);
      console.error('[chat] Groq error:', msg.slice(0, 200));
      if (msg.includes('429') || msg.includes('quota')) isRateLimit = true;
    }
  } else {
    console.warn('[chat] ⚠ GROQ_API_KEY not set');
  }

  // ── SECONDARY: OpenRouter — Gemma 3 27B free tier (fallback) ──────────────
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      console.log('[chat] → OpenRouter (secondary)');
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
        const data: any = await orRes.json();
        const text: string | undefined = data?.choices?.[0]?.message?.content;
        if (text) {
          console.log('[chat] ✓ OpenRouter OK');
          return res.status(200).json({ text });
        }
      } else {
        const body = await orRes.text().catch(() => '');
        console.error(`[chat] OpenRouter HTTP ${orRes.status}:`, body.slice(0, 200));
        if (orRes.status === 429) isRateLimit = true;
      }
    } catch (err: any) {
      console.error('[chat] OpenRouter error:', String(err?.message || err).slice(0, 200));
    }
  } else {
    console.warn('[chat] ⚠ OPENROUTER_API_KEY not set');
  }

  // ── Both providers failed ──────────────────────────────────────────────────
  if (isRateLimit) {
    return res.status(200).json({ text: RATE_LIMIT_MESSAGE });
  }

  console.error('[chat] ✗ All providers failed — check Vercel env vars');
  return res.status(200).json({
    text: "I'm having a brief moment of downtime. Please try again in **30 seconds**, or reach us directly via **WhatsApp** using the button below! 🙂",
  });
}
