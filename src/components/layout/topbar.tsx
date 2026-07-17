import { useLocation, Link } from "react-router-dom";
import { Bell, Menu, ChevronRight, Search, LogOut, LayoutGrid } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/hooks/use-sidebar";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { navItems } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/layout/notification-panel";
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

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function Topbar() {
  const location = useLocation();
  const { setMobileOpen } = useSidebar();
  const { setOpen } = useCommandPalette();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  const currentItem = navItems.find((item) =>
    item.path === "/admin" ? (location.pathname === "/admin" || location.pathname === "/admin/") : location.pathname.startsWith(item.path)
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [lastViewed, setLastViewed] = useState(() => localStorage.getItem("lastViewedNotifications") || "0");

  const { data: latestActivity } = useQuery({
    queryKey: ["latest_activity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("timestamp").order("timestamp", { ascending: false }).limit(1);
      if (error) throw error;
      return data[0];
    },
  });

  const hasNewNotifications = latestActivity && new Date(latestActivity.timestamp).getTime() > Number(lastViewed);

  const handleOpenNotifications = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen) {
      const now = Date.now().toString();
      localStorage.setItem("lastViewedNotifications", now);
      setLastViewed(now);
    }
  };

  const handleOpenWidgets = () => {
    // We will emit an event or use context, but for now we can just dispatch a custom event
    window.dispatchEvent(new CustomEvent("toggle-widgets-panel"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center gap-3 border-b border-[var(--color-edge)] bg-[var(--color-void)] px-4">
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

        {/* Widgets Panel Trigger */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenWidgets}
            aria-label="Widgets"
            className="h-7 w-7 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
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
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div className="h-4 w-px bg-[var(--color-edge)] mx-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-faint transition-colors hover:bg-[var(--color-charcoal)] hover:text-ink-dim focus:outline-none"
            >
              <span className="hidden sm:block">"Admin"</span>
              <div className="h-5 w-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/10">
                "A"
              </div>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-ink">"Admin"</p>
                <p className="text-[10px] text-ink-faint">"admin@duokarrma.com"</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-xs text-[#EF4444] focus:text-[#EF4444]">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
