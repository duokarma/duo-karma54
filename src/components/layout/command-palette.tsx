import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { navItems } from "@/lib/nav-config";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { clients } from "@/data/clients";
import { projects } from "@/data/projects";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-[18%] z-[101] w-full max-w-lg -translate-x-1/2 px-4"
          >
            <Command className="overflow-hidden rounded-[var(--radius-panel)] glass-panel-strong shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-3 border-b border-edge px-4 py-3.5">
                <Search className="h-4 w-4 text-ink-faint" />
                <Command.Input
                  autoFocus
                  placeholder="Search clients, projects, pages..."
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                />
                <kbd className="rounded border border-edge bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-faint">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-ink-faint">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Pages" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {navItems.map((item) => (
                    <Command.Item
                      key={item.path}
                      onSelect={() => go(item.path)}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 aria-selected:opacity-100" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Clients" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {clients.slice(0, 5).map((client) => (
                    <Command.Item
                      key={client.id}
                      onSelect={() => go("/clients")}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer"
                    >
                      <span className="truncate">{client.name}</span>
                      <span className="text-ink-faint truncate">— {client.company}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Projects" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {projects.slice(0, 5).map((project) => (
                    <Command.Item
                      key={project.id}
                      onSelect={() => go("/projects")}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer"
                    >
                      <span className="truncate">{project.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
