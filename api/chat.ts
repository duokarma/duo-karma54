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

  const lastUserMsg = [...apiMessages].reverse().find((m: any) => m.role === 'user')?.content || '';

  // ── PRIMARY: Groq (multi-model resilient waterfall) ────────────────────────
  const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (groqKey) {
    const groqModels = [
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'llama-3.1-8b-instant',
    ];

    for (const model of groqModels) {
      try {
        console.log(`[chat] → Groq (${model})`);
        const groqRes = await fetchWithTimeout(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, ...apiMessages],
              temperature: 0.7,
              max_tokens: 900,
            }),
          },
        );

        if (groqRes.ok) {
          const data: any = await groqRes.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            const text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (text) {
              console.log(`[chat] ✓ Groq (${model}) OK`);
              return res.status(200).json({ text });
            }
          }
        } else {
          const body = await groqRes.text().catch(() => '');
          console.warn(`[chat] Groq (${model}) HTTP ${groqRes.status}:`, body.slice(0, 150));
        }
      } catch (err: any) {
        console.warn(`[chat] Groq (${model}) error:`, String(err?.message || err).slice(0, 150));
      }
    }
  }

  // ── SECONDARY: OpenRouter (fallback) ───────────────────────────────────────
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    const orModels = [
      'google/gemma-3-27b-it:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'qwen/qwen-2.5-72b-instruct',
    ];

    for (const model of orModels) {
      try {
        console.log(`[chat] → OpenRouter (${model})`);
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
              model,
              messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, ...apiMessages],
              max_tokens: 800,
            }),
          },
        );

        if (orRes.ok) {
          const data: any = await orRes.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            const text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (text) {
              console.log(`[chat] ✓ OpenRouter (${model}) OK`);
              return res.status(200).json({ text });
            }
          }
        }
      } catch (err: any) {
        console.warn(`[chat] OpenRouter (${model}) error:`, String(err?.message || err).slice(0, 150));
      }
    }
  }

  // ── GUARANTEED UPTIME: Smart Contextual Fallback Engine ─────────────────────
  // Even if all external API providers are down or unconfigured, we NEVER show
  // a downtime error. Instead, answer accurately from the DuoKarma agency knowledge base.
  console.log('[chat] ⚡ Using DuoKarma Smart Fallback Engine');
  const query = (lastUserMsg || '').toLowerCase();
  let fallbackText = `We build high-performance custom digital solutions and business software tailored specifically to your workflow:

• **Custom Websites & Web Apps** (from ₹15,000)
• **Booking & Appointment Engines** (from ₹20,000)
• **Admin Dashboards & Staff Portals** (from ₹25,000)
• **Automated CRMs & Lead Trackers** (from ₹30,000)

Tell me what type of business you run, or click **"Book a Strategy Call"** below to discuss your project directly with our founders!`;

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('package') || query.includes('kitna') || query.includes('fees') || query.includes('budget')) {
    fallbackText = `Here is our transparent pricing for custom software solutions:

• **Custom Websites & Portfolios:** from ₹15,000 (1–2 weeks)
• **Automated Booking Systems:** from ₹20,000 (2–3 weeks)
• **Admin Management Dashboards:** from ₹25,000 (3–4 weeks)
• **CRM & Lead Pipelines:** from ₹30,000 (3–4 weeks)
• **AI Automations & WhatsApp Bots:** from ₹20,000 (2–3 weeks)
• **Full Business Suite (All-in-One):** from ₹50,000+ (4–8 weeks)

Would you like a tailored quote for your specific requirements? Feel free to **book a free strategy call** or **chat with us on WhatsApp** below!`;
  } else if (query.includes('salon') || query.includes('parlour') || query.includes('spa') || query.includes('beauty')) {
    fallbackText = `For **Salons & Spas**, we engineer dedicated business systems including:

• **Online Client Booking:** 24/7 self-service appointments with automatic slot allocation.
• **WhatsApp Reminders:** Drastically cut no-shows with automated appointment alerts.
• **Staff & Commission Tracking:** Monitor stylist schedules, tips, and payouts easily.
• **Inventory & Billing:** Real-time product stock alerts + digital billing.

Typical delivery is **2–3 weeks** starting from ₹20,000. Let's discuss your salon's workflow over a quick strategy call!`;
  } else if (query.includes('clinic') || query.includes('doctor') || query.includes('hospital') || query.includes('dental') || query.includes('patient')) {
    fallbackText = `For **Medical Clinics & Healthcare Providers**, our platforms include:

• **Patient Records & History (EMR):** Secure, organized access to patient visits and prescriptions.
• **Appointment Scheduling:** Avoid waiting room congestion with digital slot booking.
• **Automated SMS & WhatsApp Alerts:** Send follow-up dates and medication reminders.
• **Invoicing & Payments:** Fast billing with UPI and card integration.

Starting from ₹20,000–₹25,000 with high security and privacy. Click below to book a free call with our founders!`;
  } else if (query.includes('gym') || query.includes('fitness') || query.includes('workout') || query.includes('trainer')) {
    fallbackText = `For **Gyms & Fitness Studios**, we build end-to-end management suites:

• **Member Management & Renewals:** Automated payment reminders before memberships expire.
• **Class & Trainer Scheduling:** Let members reserve batch slots directly on their phones.
• **Attendance Tracking:** Digital QR check-in and attendance history.
• **Revenue & Expense Dashboard:** Complete visibility into your gym's monthly cash flow.

Starting from ₹20,000. Would you like to see a live demo on a free strategy call!`;
  } else if (query.includes('call') || query.includes('meeting') || query.includes('contact') || query.includes('talk') || query.includes('phone') || query.includes('whatsapp') || query.includes('number')) {
    fallbackText = `You can reach our founders directly through either of these options:

• **Book a Free 20-Min Strategy Call:** Tap the **"Book a Call"** button below (or visit our Google Calendar: https://calendar.app.google/ycwYzWhqVRR6ZB3R9).
• **Direct WhatsApp:** Message us directly at **+91 93138 46266** for quick queries.
• **Email:** duokarma54@gmail.com

We look forward to hearing about your project!`;
  }

  return res.status(200).json({ text: fallbackText });
}
