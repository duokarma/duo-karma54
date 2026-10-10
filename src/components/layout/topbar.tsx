import { useLocation, Link } from "react-router-dom";
import { Bell, Menu, ChevronRight, Search, LogOut, LayoutGrid, KeyRound, X } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/hooks/use-sidebar";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { navItems } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { PartnerSettingsDialog } from "@/components/layout/partner-settings-dialog";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

import { usePushNotifications } from "@/hooks/use-push-notifications";

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function Topbar() {
  usePushNotifications();
  const location = useLocation();
  const { setMobileOpen } = useSidebar();
  const { setOpen } = useCommandPalette();
  const [notifOpen, setNotifOpen] = useState(false);
  const [widgetsPanelOpen, setWidgetsPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { signOut, user, displayName, avatarUrl } = useAuth();

  const currentItem = navItems.find((item) =>
    item.path === "/admin" ? (location.pathname === "/admin" || location.pathname === "/admin/") : location.pathname.startsWith(item.path)
  );

  useEffect(() => {
    function handleClick(e: MouseEvent | TouchEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  // Track widgets panel state to toggle icon visual
  useEffect(() => {
    const handleState = (e: any) => {
      if (typeof e.detail?.open === "boolean") {
        setWidgetsPanelOpen(e.detail.open);
      }
    };
    window.addEventListener("widgets-panel-state", handleState);
    return () => {
      window.removeEventListener("widgets-panel-state", handleState);
    };
  }, []);

  const [lastViewed, setLastViewed] = useState(() => {
    try {
      return localStorage.getItem("lastViewedNotifications") || "0";
    } catch {
      return "0";
    }
  });

  const { data: latestActivity } = useQuery({
    queryKey: ["latest_activity"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("activities").select("timestamp").order("timestamp", { ascending: false }).limit(1);
        if (error) throw error;
        return data?.[0];
      } catch {
        return undefined;
      }
    },
  });

  const hasNewNotifications = Boolean(
    latestActivity?.timestamp && new Date(latestActivity.timestamp).getTime() > Number(lastViewed)
  );

  const handleOpenNotifications = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen) {
      try {
        const now = Date.now().toString();
        localStorage.setItem("lastViewedNotifications", now);
        setLastViewed(now);
      } catch {}
    }
  };

  const handleOpenWidgets = () => {
    window.dispatchEvent(new CustomEvent("toggle-widgets-panel"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center gap-1.5 sm:gap-3 border-b border-[var(--color-edge)] bg-[var(--color-void)] px-2.5 sm:px-4 max-w-full">
      {/* Mobile menu */}
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-md p-1 text-ink-faint hover:text-ink-dim lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-ink-faint h-full overflow-hidden">
        <Link to="/admin" className="hover:opacity-80 transition-opacity">
          <img src="/logo.jpeg" alt="DuoKarma" className="h-5 w-auto object-contain" />
        </Link>
        <AnimatePresence mode="popLayout">
          {currentItem && currentItem.path !== "/admin" && (
            <motion.div
              key={currentItem.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-1.5"
            >
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink-dim font-medium">{currentItem.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Date */}
        <span className="hidden text-xs text-ink-faint sm:block mr-2">{formatDate()}</span>

        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--color-edge)] bg-[var(--color-charcoal)] px-2.5 py-1 text-xs text-ink-faint transition-colors hover:border-[var(--color-edge-hover)] hover:text-ink-dim shadow-sm"
        >
          <Search className="h-3 w-3" />
          <span className="hidden sm:block">Search</span>
          <kbd className="hidden rounded border border-[var(--color-edge)] bg-[var(--color-void)] px-1 text-[10px] sm:block">⌘K</kbd>
        </motion.button>

        {/* Widgets Panel Trigger - z-[130] ensures it remains accessible and clickable above blur backdrop */}
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="relative z-[130]">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenWidgets}
            aria-label={widgetsPanelOpen ? "Close Productivity Hub" : "Open Productivity Hub"}
            title={widgetsPanelOpen ? "Close Productivity Hub (Esc)" : "Open Productivity Hub"}
            className={`h-7 w-7 transition-all rounded-md ${
              widgetsPanelOpen
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 hover:text-white"
                : "text-ink-faint hover:bg-white/10 hover:text-white"
            }`}
          >
            {widgetsPanelOpen ? <X className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
          </Button>
        </motion.div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenNotifications}
              aria-label="Notifications"
              className="relative h-7 w-7 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-3.5 w-3.5" />
              {hasNewNotifications && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
              )}
            </Button>
          </motion.div>
          {notifOpen && (
            <div className="fixed inset-x-2 top-12 sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1.5 z-50 flex justify-end">
              <NotificationPanel onClose={() => setNotifOpen(false)} />
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-[var(--color-edge)] mx-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-faint transition-colors hover:bg-[var(--color-charcoal)] hover:text-ink-dim focus:outline-none cursor-pointer"
            >
              <span className="hidden sm:block">{displayName}</span>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-5 w-5 rounded-full object-cover shadow-sm ring-1 ring-white/10"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/10">
                  {displayName[0]?.toUpperCase() ?? "A"}
                </div>
              )}
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" collisionPadding={12} sideOffset={8} className="w-56 max-w-[calc(100vw-1.5rem)]">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2.5 py-1">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-xs font-semibold text-white">
                    {displayName[0]?.toUpperCase() ?? "A"}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{displayName}</p>
                  <p className="text-[10px] text-ink-faint truncate">{user?.email ?? ""}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSettingsOpen(true)}
              className="cursor-pointer text-xs text-ink-dim hover:text-ink focus:text-ink"
            >
              <KeyRound className="mr-2 h-3.5 w-3.5 text-ink-faint" />
              Partner Settings / Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-xs text-[#EF4444] focus:text-[#EF4444]">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PartnerSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
