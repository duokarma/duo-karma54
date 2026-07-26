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
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'CEREBRAS_API_KEY is not configured on the server.' });
    }

    const { messages = [] } = req.body || {};

    const chatMessages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content || m.text || '',
      })),
    ];

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: chatMessages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (response.status === 429) {
      return res.status(200).json({ text: RATE_LIMIT_MESSAGE });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cerebras API error:', response.status, errText);
      return res.status(200).json({ text: "Sorry, I'm having trouble connecting right now. Please try again in a moment!" });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      return res.status(200).json({ text: "I didn't get a response. Please try again!" });
    }

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('AI Handler Error:', error);
    return res.status(200).json({ text: "Something went wrong on my end. Please try again shortly!" });
  }
}
