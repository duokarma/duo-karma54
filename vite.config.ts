import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url) {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/api/chat' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const dotenv = await import('dotenv');
                  dotenv.config({ path: path.resolve(__dirname, '.env.local') });
                  const apiKey = process.env.GEMINI_API_KEY;
                  if (!apiKey) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in .env.local' }));
                    return;
                  }
                  const parsed = JSON.parse(body || '{}');
                  const messages = parsed.messages || [];
                  const contents = messages.map((m: any) => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content || m.text || '' }]
                  }));

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
- Be helpful and energetic. Avoid overly verbose explanations.`;

                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({ apiKey });
                  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
                  let text = '';
                  let success = false;
                  let lastErr = '';

                  for (const m of models) {
                    try {
                      const response = await ai.models.generateContent({
                        model: m,
                        contents,
                        config: {
                          systemInstruction: systemPrompt,
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
                      lastErr = err.message || String(err);
                    }
                  }

                  res.statusCode = success ? 200 : 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ text: success ? text : undefined, error: success ? undefined : lastErr }));
                } catch (e: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
              return;
            }
            if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
              res.setHeader('Content-Type', 'application/javascript');
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
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
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
})
