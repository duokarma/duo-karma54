import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { collapsed } = useSidebar();
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[var(--color-void)]">
      <Sidebar />

      <div
        className={cn(
          "transition-[padding] duration-300",
          collapsed ? "lg:pl-[60px]" : "lg:pl-[240px]"
        )}
      >
        <Topbar />
        <main className="px-5 py-5">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
