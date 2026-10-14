import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const srcPath = path.resolve(__dirname, './src');
  const aliasReplacement = isDev ? srcPath.replaceAll('$', '$$$$') : srcPath;

  return {
    plugins: [
    react(),
    tailwindcss(),
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url) {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/api/ai' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const dotenv = await import('dotenv');
                  dotenv.config({ path: path.resolve(__dirname, '.env.local') });
                  const mod = await server.ssrLoadModule('/api/ai.ts');
                  const handler = mod.default;

                  const reqMock = {
                    method: 'POST',
                    headers: req.headers,
                    body: JSON.parse(body || '{}'),
                  };

                  const resMock = {
                    statusCode: 200,
                    headers: {} as Record<string, string>,
                    setHeader(name: string, val: string) {
                      this.headers[name] = val;
                      res.setHeader(name, val);
                    },
                    status(code: number) {
                      this.statusCode = code;
                      res.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.statusCode = this.statusCode;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    end() {
                      res.end();
                    },
                  };

                  await handler(reqMock, resMock);
                } catch (err: any) {
                  console.error('Vite /api/ai error:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal dev server error' }));
                }
              });
              return;
            }

            if (url.pathname === '/api/upload') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const dotenv = await import('dotenv');
                  dotenv.config({ path: path.resolve(__dirname, '.env.local') });
                  const mod = await server.ssrLoadModule('/api/upload.ts');
                  const handler = mod.default;

                  const reqMock = {
                    method: req.method,
                    headers: req.headers,
                    body: body ? JSON.parse(body) : {},
                    query: Object.fromEntries(url.searchParams),
                  };

                  const resMock = {
                    statusCode: 200,
                    headers: {} as Record<string, string>,
                    setHeader(name: string, val: string) {
                      this.headers[name] = val;
                      res.setHeader(name, val);
                    },
                    status(code: number) {
                      this.statusCode = code;
                      res.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.statusCode = this.statusCode;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    end(data?: any) {
                      if (data) res.end(data);
                      else res.end();
                    },
                  };

                  await handler(reqMock, resMock);
                } catch (err: any) {
                  console.error('Vite /api/upload error:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal dev server error' }));
                }
              });
              return;
            }

            if (url.pathname === '/api/chat' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const dotenv = await import('dotenv');
                  dotenv.config({ path: path.resolve(__dirname, '.env.local') });
                  const parsed = JSON.parse(body || '{}');
                  const messages = parsed.messages || [];

                  const systemPrompt = `You are DuoKarma Assistant, an expert AI business consultant for DuoKarma Business Hub.
DuoKarma specializes in building custom digital solutions, high-converting websites, admin management software, automated booking systems, CRM systems, and AI workflows for businesses (Salons, Medical Clinics, Gyms, Restaurants, Farmhouses, and Service Enterprises).

Your Objectives:
1. Warmly greet users and act as a knowledgeable, friendly software consultant.
2. Ask about their business type, goals, key operational challenges, or features they are looking for.
3. Recommend tailored digital solutions (e.g. for Salons: appointment booking + staff management + billing; for Clinics: patient records + secure billing + reminders).
4. Provide estimated project timelines (e.g. 1-3 weeks for standard systems, 3-6 weeks for enterprise platforms).
5. Gently encourage them to book a free 20-min strategy call or request a custom proposal.

Guidelines:
- Keep responses clear, professional, concise, and structured with clean formatting or short bullet points.
- Be helpful and energetic. Avoid overly verbose explanations.
- NEVER provide raw calendar links or URLs. Instead, tell them to use the "Book a Strategy Call" button below the chat.`;

                  // ── Groq high-speed provider (Primary multi-model) ────────────────
                  const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
                  if (groqKey) {
                    const groqModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant'];
                    for (const model of groqModels) {
                      try {
                        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${groqKey}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            model,
                            messages: [
                              { role: 'system', content: systemPrompt },
                              ...messages.map((m: any) => ({
                                role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
                                content: m.content || m.text || '',
                              })),
                            ],
                            temperature: 0.7,
                            max_tokens: 1000,
                          }),
                        });
                        if (groqRes.ok) {
                          const groqData: any = await groqRes.json();
                          const rawText = groqData?.choices?.[0]?.message?.content;
                          if (rawText) {
                            const text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                            if (text) {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.end(JSON.stringify({ text }));
                              return;
                            }
                          }
                        }
                      } catch (gErr) {
                        // Try next model
                      }
                    }
                  }

                  // ── Smart Knowledge Fallback (Guaranteed 100% Uptime) ──────────────
                  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
                  const query = (lastUserMsg || '').toLowerCase();
                  let text = `We build high-performance custom digital solutions and business software tailored specifically to your workflow:

• **Custom Websites & Web Apps** (from ₹15,000)
• **Booking & Appointment Engines** (from ₹20,000)
• **Admin Dashboards & Staff Portals** (from ₹25,000)
• **Automated CRMs & Lead Trackers** (from ₹30,000)

Tell me what type of business you run, or click **"Book a Strategy Call"** below to discuss your project directly with our founders!`;

                  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('package') || query.includes('kitna') || query.includes('fees') || query.includes('budget')) {
                    text = `Here is our transparent pricing for custom software solutions:

• **Custom Websites & Portfolios:** from ₹15,000 (1–2 weeks)
• **Automated Booking Systems:** from ₹20,000 (2–3 weeks)
• **Admin Management Dashboards:** from ₹25,000 (3–4 weeks)
• **CRM & Lead Pipelines:** from ₹30,000 (3–4 weeks)
• **AI Automations & WhatsApp Bots:** from ₹20,000 (2–3 weeks)
• **Full Business Suite (All-in-One):** from ₹50,000+ (4–8 weeks)

Would you like a tailored quote for your specific requirements? Feel free to **book a free strategy call** or **chat with us on WhatsApp** below!`;
                  } else if (query.includes('salon') || query.includes('parlour') || query.includes('spa') || query.includes('beauty')) {
                    text = `For **Salons & Spas**, we engineer dedicated business systems including:

• **Online Client Booking:** 24/7 self-service appointments with automatic slot allocation.
• **WhatsApp Reminders:** Drastically cut no-shows with automated appointment alerts.
• **Staff & Commission Tracking:** Monitor stylist schedules, tips, and payouts easily.
• **Inventory & Billing:** Real-time product stock alerts + digital billing.

Typical delivery is **2–3 weeks** starting from ₹20,000. Let's discuss your salon's workflow over a quick strategy call!`;
                  } else if (query.includes('clinic') || query.includes('doctor') || query.includes('hospital') || query.includes('dental') || query.includes('patient')) {
                    text = `For **Medical Clinics & Healthcare Providers**, our platforms include:

• **Patient Records & History (EMR):** Secure, organized access to patient visits and prescriptions.
• **Appointment Scheduling:** Avoid waiting room congestion with digital slot booking.
• **Automated SMS & WhatsApp Alerts:** Send follow-up dates and medication reminders.
• **Invoicing & Payments:** Fast billing with UPI and card integration.

Starting from ₹20,000–₹25,000 with high security and privacy. Click below to book a free call with our founders!`;
                  } else if (query.includes('call') || query.includes('meeting') || query.includes('contact') || query.includes('talk') || query.includes('phone') || query.includes('whatsapp') || query.includes('number')) {
                    text = `You can reach our founders directly through either of these options:

• **Book a Free 20-Min Strategy Call:** Tap the **"Book a Call"** button below (or visit our Google Calendar: https://calendar.app.google/ycwYzWhqVRR6ZB3R9).
• **Direct WhatsApp:** Message us directly at **+91 93138 46266** for quick queries.
• **Email:** duokarma54@gmail.com

We look forward to hearing about your project!`;
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ text }));
                } catch (e: any) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ text: "Hello! We build custom websites, admin dashboards, booking platforms, and CRMs. How can we help your business today? Feel free to book a strategy call or message us on WhatsApp!" }));
                }
              });
              return;
            }
          }
          next();
        });
      }
    },
    // Generates dist/stats.html — open it in a browser after `npm run build`
    // to see the treemap of every module. `open: false` so it doesn't pop up
    // automatically during CI builds.
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: aliasReplacement,
      },
    ],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // ── Heavy graphics stack (three.js, R3F, drei) ─────────────────
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          // ── Charting (recharts + d3 transitive deps) ───────────────────
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          // ── Framer Motion ──────────────────────────────────────────────
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          // ── Radix UI primitives ────────────────────────────────────────
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // ── Dashboard-only dependencies ────────────────────────────────
          // These are bundled by the lazy dashboard-shell chunk, but explicit
          // grouping keeps them out of any shared chunk that the marketing
          // page might otherwise pull in.
          if (
            id.includes('@tanstack/react-query') ||
            id.includes('@supabase/supabase-js') ||
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('zod') ||
            id.includes('/node_modules/cmdk/')
          ) {
            return 'vendor-dashboard';
          }
        },
      },
    },
  },
};
});
