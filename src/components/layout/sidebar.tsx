import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { m as motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, Search, LogOut, ArrowUpRight, Plus, Pencil, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, navItems } from "@/lib/nav-config";
import { useSidebar } from "@/hooks/use-sidebar";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DynamicSchema } from "@/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useEcosystemApps } from "@/hooks/use-ecosystem-apps";
import { ManageAppsDialog } from "@/components/layout/manage-apps-dialog";

// Map icon name → emoji for sidebar rendering (lightweight, no extra deps)
const ICON_EMOJI: Record<string, string> = {
  Database: "🗄️", Users: "👥", Star: "⭐", Heart: "❤️", Briefcase: "💼",
  ShoppingCart: "🛒", Package: "📦", Tag: "🏷️", FileText: "📄",
  BarChart3: "📊", Layers: "🗂️", Globe: "🌍", Building2: "🏢",
  Truck: "🚚", Zap: "⚡", Target: "🎯", BookOpen: "📖", Award: "🏆",
  Calendar: "📅", Camera: "📷", Music: "🎵", Coffee: "☕", Gift: "🎁", Home: "🏠",
};

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { setOpen } = useCommandPalette();
  const { signOut, user, displayName, avatarUrl } = useAuth();
  const navigate = useNavigate();

  const { apps } = useEcosystemApps();
  const [appsOpen, setAppsOpen] = useState(false);
  const [manageAppsOpen, setManageAppsOpen] = useState(false);
  const [selectedEditAppId, setSelectedEditAppId] = useState<string | null>(null);

  const userEmail = user?.email ?? "";

  // Fetch user-created schemas for the dynamic sidebar section
  const { data: dynamicSchemas = [] } = useQuery({
    queryKey: ["dynamic_schemas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_schemas")
        .select("id, name, slug, icon")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Pick<DynamicSchema, "id" | "name" | "slug" | "icon">[];
    },
  });

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
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
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
            onClick={() => navigate("/admin")}
            aria-label="Go to Admin Dashboard"
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
            aria-label="Search command palette"
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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-8 custom-scrollbar">
          {navGroups.map((group) => {
            const items = navItems.filter((item) => item.group === group);
            const isDynamicGroup = group === "Custom";

            return (
              <div key={group} className="mb-3">
                {!collapsed && (
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-ink/70">
                    {group}
                  </p>
                )}
                <div className="space-y-1 lg:space-y-0.5">
                  {/* Static nav items in this group */}
                  {items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      onClick={() => setMobileOpen(false)}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2.5 lg:px-2.5 lg:py-1.5 text-sm transition-colors duration-150",
                          collapsed && "justify-center px-0 py-2",
                          isActive
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-ink/80 hover:bg-white/5 hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <motion.span
                              layoutId="sidebar-active-indicator"
                              className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]"
                            />
                          )}
                          <div
                            className="pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2"
                          >
                            <item.icon
                              className={cn(
                                "h-[15px] w-[15px] shrink-0",
                                isActive ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" : "text-ink/70 group-hover:text-ink/90"
                              )}
                            />
                          </div>
                          {!collapsed && (
                            <span className={cn("truncate text-[13px]", isActive && "font-medium text-ink")}>
                              {item.label}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}

                  {/* Dynamic schema links rendered under the Custom group */}
                  {isDynamicGroup && dynamicSchemas.map((schema) => (
                    <NavLink
                      key={schema.id}
                      to={`/admin/custom/${schema.slug}`}
                      onClick={() => setMobileOpen(false)}
                      aria-label={schema.name}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2.5 lg:px-2.5 lg:py-1.5 text-sm transition-colors duration-150",
                          collapsed && "justify-center px-0 py-2",
                          isActive
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-ink/80 hover:bg-white/5 hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <motion.span
                              layoutId="sidebar-active-indicator"
                              className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]"
                            />
                          )}
                          <div
                            className="text-base leading-none shrink-0 pointer-events-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2"
                          >
                            {ICON_EMOJI[schema.icon] ?? "🗄️"}
                          </div>
                          {!collapsed && (
                            <span className={cn("truncate text-[13px]", isActive && "font-medium text-ink")}>
                              {schema.name}
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

          {/* ── Ecosystem & Client Apps Section (Collapsible Dropdown) ── */}
          <div className="mt-4 pt-3 border-t border-white/[0.08]">
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between px-2 pb-1.5">
                  <button
                    type="button"
                    onClick={() => setAppsOpen(!appsOpen)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink/70 hover:text-white transition-colors cursor-pointer"
                    aria-expanded={appsOpen}
                  >
                    <motion.div
                      animate={{ rotate: appsOpen ? 90 : 0 }}
                      transition={{ duration: 0.18 }}
                      className="shrink-0"
                    >
                      <ChevronRight className="h-3 w-3 text-ink-faint" />
                    </motion.div>
                    <span>Apps & Sites</span>
                    {apps.length > 0 && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] font-normal text-ink-faint">
                        {apps.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEditAppId(null);
                      setManageAppsOpen(true);
                    }}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-ink-faint hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Add or manage apps"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Dropdown Content: visible only when expanded, otherwise hidden */}
                <AnimatePresence initial={false}>
                  {appsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-1 lg:space-y-0.5 pt-1"
                    >
                      {apps.map((app) => (
                        <div
                          key={app.id}
                          className="group relative flex items-center justify-between rounded-[var(--radius-control)] px-2.5 py-2 lg:py-1.5 text-sm transition-colors duration-150 hover:bg-white/5"
                        >
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileOpen(false)}
                            className="flex-1 min-w-0 flex items-center gap-2.5"
                          >
                            <div className="h-6 w-6 lg:h-5 lg:w-5 rounded-md overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                              <img
                                src={app.imageUrl || "/logo.jpeg"}
                                alt={app.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/logo.jpeg";
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] lg:text-[12.5px] font-medium text-ink/80 group-hover:text-white transition-colors">
                                {app.title}
                              </p>
                            </div>
                            <ArrowUpRight className="h-3.5 w-3.5 lg:h-3 lg:w-3 shrink-0 text-ink-faint/60 transition-transform group-hover:text-ink-dim group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>

                          {/* Edit Pencil: Always visible on mobile, visible on hover on desktop */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEditAppId(app.id);
                              setManageAppsOpen(true);
                            }}
                            className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 lg:p-1 ml-1 rounded-md text-ink-faint hover:text-white hover:bg-white/10 active:bg-white/20 transition-all shrink-0 touch-manipulation cursor-pointer"
                            title={`Edit ${app.title}`}
                            aria-label={`Edit ${app.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5 lg:h-3 lg:w-3" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEditAppId(null);
                        setManageAppsOpen(true);
                      }}
                      className="rounded p-1 text-ink-faint hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Add or manage apps"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Add or manage apps
                  </TooltipContent>
                </Tooltip>

                {apps.map((app) => (
                  <Tooltip key={app.id}>
                    <TooltipTrigger asChild>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileOpen(false)}
                        className="group relative flex items-center justify-center rounded-[var(--radius-control)] py-1.5 transition-colors hover:bg-white/10"
                      >
                        <div className="h-6 w-6 rounded-md overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
                          <img
                            src={app.imageUrl || "/logo.jpeg"}
                            alt={app.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo.jpeg";
                            }}
                          />
                        </div>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      <span>{app.title}</span>
                      {app.category && (
                        <span className="text-[10px] text-ink-faint font-mono">
                          ({app.category})
                        </span>
                      )}
                      <ArrowUpRight className="h-3 w-3 opacity-70" />
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── User profile + Collapse ── */}
        <div className="border-t border-[var(--color-edge)]">
          {/* User row */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-7 w-7 shrink-0 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white shadow-sm ring-1 ring-white/10">
                  {displayName[0]?.toUpperCase() ?? "A"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{displayName}</p>
                <p className="truncate text-[10px] text-ink-faint">{userEmail}</p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-[var(--color-charcoal)] hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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

      {/* ── Ecosystem Apps Management Modal ── */}
      <ManageAppsDialog
        open={manageAppsOpen}
        onOpenChange={setManageAppsOpen}
        initialEditAppId={selectedEditAppId}
      />
    </>
  );
}
