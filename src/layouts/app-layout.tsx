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
    <div className="relative min-h-screen">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-electric/[0.07] blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[450px] w-[450px] rounded-full bg-violet/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan/[0.05] blur-[120px]" />
      </div>

      <Sidebar />

      <div
        className={cn(
          "relative transition-[padding] duration-300",
          collapsed ? "lg:pl-[100px]" : "lg:pl-[284px]"
        )}
      >
        <main className="px-4 pb-6 pt-3 lg:px-6">
          <Topbar />
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
