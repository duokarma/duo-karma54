import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronsLeft, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, navItems } from "@/lib/nav-config";
import { useSidebar } from "@/hooks/use-sidebar";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/shared/avatar";

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { setOpen } = useCommandPalette();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const userEmail = user?.email || "user@duokarrma.com";
  const displayName = userEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 60 : 240 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden",
          "bg-void/40 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
          "lg:translate-x-0 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ── Logo / Workspace ── */}
        <div className={cn(
          "flex items-center gap-2.5 border-b border-[var(--color-edge)] px-3.5 py-4",
          collapsed && "justify-center px-0"
        )}>
          <button
            onClick={() => navigate("/")}
            className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md"
          >
            <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
          </button>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="min-w-0 overflow-hidden"
            >
              <p className="truncate text-sm font-semibold text-ink">DuoKarma</p>
              <p className="truncate text-[10px] text-ink-faint">Business Hub</p>
            </motion.div>
          )}
        </div>

        {/* ── Search trigger ── */}
        <div className={cn("px-2.5 py-2.5", collapsed && "px-1.5")}>
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-edge)] bg-[var(--color-charcoal)] px-2.5 py-1.5 text-xs text-ink-faint transition-colors hover:border-[var(--color-edge-hover)] hover:text-ink-dim",
              collapsed && "justify-center px-0 py-1.5"
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search...</span>
                <kbd className="rounded border border-[var(--color-edge)] bg-[var(--color-void)] px-1 text-[10px]">⌘K</kbd>
              </>
            )}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {navGroups.map((group) => {
            const items = navItems.filter((item) => item.group === group);
            return (
              <div key={group} className="mb-3">
                {!collapsed && (
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-ink/70">
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
                          "group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-sm transition-colors duration-150",
                          collapsed && "justify-center px-0 py-2",
                          isActive
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-ink/80 hover:bg-white/5 hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Left accent bar */}
                          {isActive && !collapsed && (
                            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-[var(--color-accent)]" />
                          )}
                          <item.icon
                            className={cn(
                              "h-[15px] w-[15px] shrink-0",
                              isActive ? "text-white" : "text-ink/70 group-hover:text-ink/90"
                            )}
                          />
                          {!collapsed && (
                            <span className={cn("truncate text-[13px]", isActive && "font-medium text-ink")}>
                              {item.label}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── User profile + Collapse ── */}
        <div className="border-t border-[var(--color-edge)]">
          {/* User row */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <Avatar seed={userEmail} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{displayName}</p>
                <p className="truncate text-[10px] text-ink-faint">{userEmail}</p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-[var(--color-charcoal)] hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-xs text-ink-faint transition-colors hover:bg-[var(--color-charcoal)] hover:text-ink-dim",
              collapsed ? "justify-center" : "border-t border-[var(--color-edge)]"
            )}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </motion.div>
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
