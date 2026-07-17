import { Outlet, useLocation } from "react-router-dom";
import { m as motion, AnimatePresence } from "framer-motion";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { WidgetsPanel } from "@/components/layout/widgets-panel";
import { AnimatedNoise, SoftAurora, FloatingParticles } from "@/components/premium/ambient-effects";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { collapsed } = useSidebar();
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[#0c0c0c] text-[var(--color-ink)]">
      {/* Global Background Video for Aura styling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover pointer-events-none opacity-50"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" 
        />
        {/* Ambient Effects Overlay */}
        <SoftAurora />
        <FloatingParticles />
        <AnimatedNoise />
      </div>

      <div className="relative z-10">
      <Sidebar />

      <div
        className={cn(
          "transition-[padding] duration-300",
          collapsed ? "lg:pl-[60px]" : "lg:pl-[240px]"
        )}
      >
        <Topbar />
        <ScrollProgress />
        <main className="px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      </div>

      <CommandPalette />
      <WidgetsPanel />
    </div>
  );
}
