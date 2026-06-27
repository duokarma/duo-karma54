import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronsLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, navItems } from "@/lib/nav-config";
import { useSidebar } from "@/hooks/use-sidebar";
import { useCommandPalette } from "@/hooks/use-command-palette";

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { setOpen } = useCommandPalette();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={cn(
          "fixed left-3 top-3 bottom-3 z-50 flex flex-col rounded-[var(--radius-panel)] bg-black/20 backdrop-blur-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]",
          "lg:translate-x-0 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-[var(--shadow-glow-blue)]">
            <img src="/logo.jpeg" alt="DuoKarma Logo" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden"
            >
              <p className="font-display text-sm font-semibold tracking-tight text-ink whitespace-nowrap">
                DuoKarma
              </p>
              <p className="text-[10px] text-ink-faint whitespace-nowrap">Business Hub</p>
            </motion.div>
          )}
        </div>

        {/* Search trigger */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-edge bg-white/[0.03] px-3 py-2 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink-dim",
              collapsed && "justify-center"
            )}
          >
            <Search className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="text-xs">Search...</span>
                <kbd className="ml-auto rounded border border-edge bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-faint">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {navGroups.map((group) => {
            const items = navItems.filter((item) => item.group === group);
            return (
              <div key={group} className="mb-4">
                {!collapsed && (
                  <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    {group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "text-ink"
                            : "text-ink-dim hover:bg-white/5 hover:text-ink"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.div
                              layoutId="active-nav-pill"
                              className="absolute inset-0 rounded-[var(--radius-control)] bg-gradient-to-r from-electric/20 to-violet/15 border border-electric/25"
                              transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                          )}
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 relative z-10",
                              isActive && "text-electric"
                            )}
                          />
                          {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-edge p-3">
          <button
            onClick={toggleCollapsed}
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-ink-faint transition-colors hover:bg-white/5 hover:text-ink-dim",
              collapsed && "justify-center"
            )}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronsLeft className="h-4 w-4" />
            </motion.div>
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
