import { useLocation, Link, useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, Menu, ChevronRight, Command, LogOut, Settings, User } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useSidebar } from "@/hooks/use-sidebar";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { Avatar } from "@/components/shared/avatar";
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

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { setMobileOpen } = useSidebar();
  const { setOpen } = useCommandPalette();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  const currentItem = navItems.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
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
    <header className="sticky top-3 z-30 mb-4 flex items-center gap-3 rounded-[var(--radius-panel)] glass-panel px-4 py-3 shadow-[var(--shadow-panel)]">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-1.5 text-ink-dim hover:bg-white/5 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link to="/" className="text-ink-faint hover:text-ink-dim transition-colors">
          Home
        </Link>
        {currentItem && currentItem.path !== "/" && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
            <span className="font-medium text-ink">{currentItem.label}</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Global search / command palette trigger */}
        <button
          onClick={() => setOpen(true)}
          className="hidden items-center gap-2 rounded-[var(--radius-control)] border border-edge bg-white/[0.03] px-3 py-1.5 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink-dim md:flex"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="text-xs">Quick actions</span>
        </button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose ring-2 ring-graphite" />
          </Button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div className="ml-1 h-6 w-px bg-edge" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none">
              <Avatar seed={user?.email || "User"} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-ink">My Account</p>
                <p className="text-xs leading-none text-ink-faint">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-rose focus:text-rose">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
