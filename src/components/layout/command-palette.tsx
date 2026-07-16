import { useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Clock, Pin, Plus } from "lucide-react";
import { navItems } from "@/lib/nav-config";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Client, Project } from "@/types";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  const { data: clients = [] } = useQuery({
    queryKey: ["clients", "cmd"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").limit(5);
      return (data as Client[]) || [];
    },
    enabled: open,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "cmd"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").limit(5);
      return (data as Project[]) || [];
    },
    enabled: open,
  });

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
            initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed left-1/2 top-[18%] z-[101] w-full max-w-lg -translate-x-1/2 px-4"
          >
            <Command label="Command Palette" className="overflow-hidden rounded-[var(--radius-panel)] glass-panel-strong shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-3 border-b border-edge px-4 py-3.5">
                <Search className="h-4 w-4 text-ink-faint" />
                <Command.Input
                  autoFocus
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search clients, projects, pages..."
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                  aria-label="Search command palette"
                />
                <kbd aria-hidden="true" className="rounded border border-edge bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-faint">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <Command.Empty className="py-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center justify-center gap-3 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-edge shadow-sm">
                      <Search className="h-5 w-5 text-ink-faint/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">No results found</p>
                      <p className="mt-1 text-xs text-ink-faint">Try a different search term or explore pages.</p>
                    </div>
                  </motion.div>
                </Command.Empty>

                {search.length === 0 && (
                  <>
                    <Command.Group heading="Recent Actions" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      {[
                        { label: "Add new client", icon: Plus, path: "/admin/clients/new" },
                        { label: "View financials", icon: Clock, path: "/admin/financials" },
                      ].map((action, i) => (
                        <Command.Item
                          key={action.label}
                          onSelect={() => go(action.path)}
                          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer group"
                        >
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <action.icon className="h-4 w-4" />
                          </motion.div>
                          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            {action.label}
                          </motion.span>
                          <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-aria-selected:opacity-100" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                    <Command.Group heading="Pinned Actions" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      {[
                        { label: "Create Project", icon: Pin, path: "/admin/projects/new" },
                      ].map((action, i) => (
                        <Command.Item
                          key={action.label}
                          onSelect={() => go(action.path)}
                          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer group"
                        >
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }}>
                            <action.icon className="h-4 w-4" />
                          </motion.div>
                          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }}>
                            {action.label}
                          </motion.span>
                          <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-aria-selected:opacity-100" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                )}

                <Command.Group heading="Pages" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {navItems.map((item, i) => (
                    <Command.Item
                      key={item.path}
                      onSelect={() => go(item.path)}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer group"
                    >
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        {item.label}
                      </motion.span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Clients" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {clients.slice(0, 5).map((client, i) => (
                    <Command.Item
                      key={client.id}
                      onSelect={() => go("/clients")}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer group"
                    >
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="truncate">
                        {client.name}
                      </motion.span>
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="text-ink-faint truncate">
                        — {client.company}
                      </motion.span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Projects" className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {projects.slice(0, 5).map((project, i) => (
                    <Command.Item
                      key={project.id}
                      onSelect={() => go("/projects")}
                      className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-ink-dim aria-selected:bg-electric/15 aria-selected:text-ink cursor-pointer group"
                    >
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="truncate">
                        {project.name}
                      </motion.span>
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
