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
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            // Provide a dummy base to properly parse the path
            const url = new URL(req.url, 'http://localhost');
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
