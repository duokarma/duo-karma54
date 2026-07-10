import { useLocation, Link } from "react-router-dom";
import { Bell, Menu, ChevronRight, Search, LogOut, Plus } from "lucide-react";
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
  const { user, signOut } = useAuth();

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
      <div className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Link to="/admin" className="hover:opacity-80 transition-opacity">
          <img src="/logo.jpeg" alt="DuoKarma" className="h-5 w-auto object-contain" />
        </Link>
        {currentItem && currentItem.path !== "/admin" && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-dim">{currentItem.label}</span>
          </>
        )}
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Date */}
        <span className="hidden text-xs text-ink-faint sm:block mr-2">{formatDate()}</span>

        {/* Search */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--color-edge)] bg-[var(--color-charcoal)] px-2.5 py-1 text-xs text-ink-faint transition-colors hover:border-[var(--color-edge-hover)] hover:text-ink-dim"
        >
          <Search className="h-3 w-3" />
          <span className="hidden sm:block">Search</span>
          <kbd className="hidden rounded border border-[var(--color-edge)] bg-[var(--color-void)] px-1 text-[10px] sm:block">⌘K</kbd>
        </button>

        {/* Quick Access */}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-ink-faint hover:text-ink-dim" title="Quick Add">
          <Plus className="h-3.5 w-3.5" />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            className="relative h-7 w-7"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
          </Button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div className="h-4 w-px bg-[var(--color-edge)] mx-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-faint transition-colors hover:bg-[var(--color-charcoal)] hover:text-ink-dim focus:outline-none">
              <span className="hidden sm:block">{user?.email?.split("@")[0] || "Account"}</span>
              <div className="h-5 w-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[10px] font-semibold text-white">
                {(user?.email?.[0] || "U").toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-ink">{user?.email?.split("@")[0] || "User"}</p>
                <p className="text-[10px] text-ink-faint">{user?.email || "user@duokarrma.com"}</p>
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
