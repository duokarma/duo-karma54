import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/hooks/use-theme";
import { PageLoader } from "@/components/shared/page-loader";
import { AuthProvider } from "@/hooks/use-auth";

// ── Marketing pages (marketing chunk — no dashboard deps) ──────────────────
const LandingPage = lazy(() =>
  import("@/pages/landing").then((m) => ({ default: m.LandingPage }))
);

// ── Dashboard shell (separate async chunk) ────────────────────────────────
// This single dynamic import carries: QueryClient, react-query, Radix providers,
// cmdk, ToastProvider, TooltipProvider, SidebarProvider, CommandPaletteProvider,
// AppLayout, and all dashboard + login page chunks.
// Marketing visitors at "/" NEVER download this chunk.
const DashboardShell = lazy(() =>
  import("@/components/shared/dashboard-shell").then((m) => ({
    default: m.DashboardShell,
  }))
);

// Prefetch the crystal scene (three.js + drei) during idle time.
// It's used on Login and Dashboard — prefetching avoids a skeleton flash
// on first navigation, without blocking marketing page first paint.
function usePrefetchCrystalScene() {
  useEffect(() => {
    const prefetch = () => {
      import("@/components/three/crystal-scene");
    };
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(prefetch, {
        timeout: 2000,
      });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const timer = setTimeout(prefetch, 300);
    return () => clearTimeout(timer);
  }, []);
}

function App() {
  usePrefetchCrystalScene();

  return (
    <AuthProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public marketing route ── */}
                <Route path="/" element={<LandingPage />} />

                {/* ── Dashboard shell (lazy chunk) ── */}
                {/* We use a wildcard route so all other paths delegate to the shell,
                    which contains its own routing logic for /login, /admin, and 404s */}
                <Route path="/*" element={<DashboardShell />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MotionConfig>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
