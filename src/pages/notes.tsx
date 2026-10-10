import { useState, useEffect, useMemo } from "react";
import {
  StickyNote, Plus, Search, Trash2, Pin, PinOff,
  Copy, Check, Download, Folder, ChevronLeft,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export interface NoteItem {
  id: string;
  title: string;
  category: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: "sec-audit-20",
    title: "System & Security Hardening Checklist",
    category: "Engineering & Security",
    pinned: true,
    updatedAt: new Date().toISOString(),
    content: `# DuoKarma 20-Point Security & Production Hardening Checklist

Status: 20 / 20 Hardened (18 Passed · 1 Supported · 1 Monitored)

---

### 1. Data & Injection
- **SEC-01: SQL Injection Prevention** [CRITICAL · PASSED]
  PostgREST enforces parameterized queries by default. No raw SQL concatenation.
  → Verify: All dynamic user inputs compile to parameter bindings in Supabase client.

- **SEC-14: Enable Row Level Security (RLS)** [CRITICAL · PASSED]
  RLS is explicitly enabled on 100% of tables in migration.sql.
  → Verify: pg_tables query confirms rowsecurity is true across all public tables.

---

### 2. App & Frontend Hardening
- **SEC-02: Block Cross-Site Scripting (XSS)** [CRITICAL · PASSED]
  React JSX syntax automatically escapes rendered strings. Zero dangerouslySetInnerHTML.
  → Verify: No innerHTML or eval calls present anywhere in the frontend codebase.

- **SEC-04: Validate File Uploads** [HIGH · PASSED]
  Supabase storage validates files, sanitizes filenames, and partitions into folder scopes.
  → Verify: File uploads conform to strict size caps and safe extension validation.

- **SEC-08: Keep API Keys Server-Side** [CRITICAL · PASSED]
  Groq and Gemini secret credentials are kept server-side in /api/ endpoints.
  → Verify: Frontend production bundle contains zero private API keys.

- **SEC-17: Remove Exposed Source Maps** [MEDIUM · PASSED]
  vite.config.ts explicitly sets build.sourcemap: false. Zero .map files in dist/.
  → Verify: Inspecting dist/assets/ confirms no .map files are published.

- **SEC-19: Keep Sensitive Data Out of Logs** [HIGH · PASSED]
  API error responses are sanitized. Passwords and bearer tokens are never logged.
  → Verify: Server logs contain zero plaintext credentials or tokens.

- **SEC-20: Update Vulnerable Dependencies** [HIGH · MONITORED]
  Project packages tracked in package.json and regularly inspected via npm audit.
  → Verify: Regular npm audit fix ensures known CVEs are patched.

---

### 3. Authentication & Access Control
- **SEC-05: Fix Broken Object Authorization (BOLA)** [CRITICAL · PASSED]
  Supabase Row Level Security (RLS) ensures records require authenticated session context.
  → Verify: Unauthenticated client querying leads/clients returns 0 records.

- **SEC-07: Secure JWT Secrets** [CRITICAL · PASSED]
  Supabase Auth signs tokens with high-entropy keys with 60-minute automated expiry.
  → Verify: Tokens expire hourly and refresh automatically via Supabase client SDK.

- **SEC-09: Hash Passwords Securely** [CRITICAL · PASSED]
  Supabase Auth hashes passwords with salted Argon2 / bcrypt before saving in auth.users.
  → Verify: Passwords in Supabase are stored only as salted cryptographic hashes.

- **SEC-10: Add Multi-Factor Authentication (MFA)** [HIGH · SUPPORTED]
  Supabase Auth natively supports TOTP (Google Authenticator) enrollments.
  → Verify: Can be toggled in Supabase Dashboard -> Authentication -> MFA.

- **SEC-12: Remove Auth Token from LocalStorage** [MEDIUM · MITIGATED]
  Device remember-me stores only partner names. Token theft mitigated by strict XSS defense.
  → Verify: localStorage stores no plain-text passwords or secret credentials.

- **SEC-13: Enforce Permissions Server-Side** [CRITICAL · PASSED]
  Database RLS policies validate identity independently of frontend UI controls.
  → Verify: Direct database mutations without valid partner credentials fail.

- **SEC-18: Change Default Credentials** [HIGH · PASSED]
  Individual partner accounts (Hatim & Moiz) with custom password update in Topbar.
  → Verify: Default credentials (admin/admin) do not exist anywhere in the system.

---

### 4. Network & API
- **SEC-03: Add CSRF Protection** [HIGH · PASSED]
  Single-page app relies on Bearer authorization headers rather than ambient cookies.
  → Verify: Cross-origin requests lacking explicit Bearer auth tokens are rejected.

- **SEC-06: Add Rate Limiting** [HIGH · PASSED]
  AI cascades have exponential backoff; Vercel rate limiting protects production domain.
  → Verify: Rapid request bursts trigger graceful throttling on AI endpoints.

- **SEC-11: Tighten CORS Settings** [HIGH · PASSED]
  Production endpoints reflect verified origin domains rather than wildcard *.
  → Verify: Unauthorized cross-origin browser requests are rejected.

- **SEC-15: Verify Webhook Signatures** [HIGH · PASSED]
  api/webhook.ts verifies authorization bearer header against WEBHOOK_SECRET.
  → Verify: Unsigned webhook requests immediately receive 401 Unauthorized.

- **SEC-16: Check for SSRF (Server-Side Forgery)** [HIGH · PASSED]
  Serverless functions only contact hardcoded vendor endpoints (Groq, Google Gemini).
  → Verify: Zero arbitrary user-supplied URLs are fetched by the server.
`,
  },
  {
    id: "partner-playbook",
    title: "DuoKarma Partner Playbook & Client Policy",
    category: "Operations",
    pinned: false,
    updatedAt: new Date().toISOString(),
    content: `# DuoKarma Partner Playbook

### Standard Client Engagement Process:
1. **Discovery & Quotation:**
   - Every lead starts in Pipeline under "New" or "Contacted".
   - Project value, estimated timeline, and GST applicability must be specified.

2. **Advance Payment Rule:**
   - Standard advance deposit of 30% - 50% must be received and logged in Finance before active development begins.
   - Record received advance directly in Client Drawer -> Advance Received.

3. **Invoicing & Milestone Deliveries:**
   - Deliverables divided into milestones.
   - Client access shared via Supabase Storage public links or client portal.

4. **Commission Tracking:**
   - If an affiliate or partner earned a referral commission, check "Commission Applicable" in Lead/Client edit card.
   - Specify name and commission amount for transparent profit calculation.
`,
  },
];

const STORAGE_KEY = "dk_partner_notes_v1";

export function NotesPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_NOTES;
  });

  const [selectedId, setSelectedId] = useState<string>(() => notes[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copied, setCopied] = useState(false);
  const [mobileDetailView, setMobileDetailView] = useState(false);

  // Sync notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory =
          selectedCategory === "all" || n.category === selectedCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, searchQuery, selectedCategory]);

  const activeNote = notes.find((n) => n.id === selectedId) || notes[0];

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      category: "General",
      content: "",
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setMobileDetailView(true);
    toast({
      title: "New note created",
      description: "Give your note a title and start jotting down thoughts.",
    });
  };

  const handleUpdateActiveNote = (fields: Partial<NoteItem>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, ...fields, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (notes.length <= 1) {
      toast({
        title: "Cannot delete note",
        description: "You must keep at least one note in your workspace.",
        variant: "destructive",
      });
      return;
    }
    const nextList = notes.filter((n) => n.id !== id);
    setNotes(nextList);
    if (selectedId === id) {
      setSelectedId(nextList[0]?.id || "");
    }
    setMobileDetailView(false);
    toast({
      title: "Note deleted",
      description: "Note removed from workspace.",
    });
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleCopyContent = () => {
    if (!activeNote) return;
    const text = `# ${activeNote.title}\n\nCategory: ${activeNote.category}\n\n${activeNote.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Full note text copied.",
    });
  };

  const handleDownloadMarkdown = () => {
    if (!activeNote) return;
    const filename = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "note"}.md`;
    const text = `# ${activeNote.title}\n\nCategory: ${activeNote.category}\n\n${activeNote.content}`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notes & Playbooks"
        description="Organize company audit logs, engineering checklists, client SOPs, and partner scratchpads."
        actions={
          <Button onClick={handleCreateNote} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Button>
        }
      />

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
        {/* ── Left Sidebar / Note List ── */}
        <div
          className={`lg:col-span-4 flex flex-col gap-3 ${
            mobileDetailView ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search & New Note Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
              <Input
                placeholder="Search notes by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-void border-[var(--color-edge)]"
              />
            </div>
            <Button
              size="sm"
              onClick={handleCreateNote}
              className="h-8 px-2.5 gap-1 text-xs shrink-0"
              title="Create new note"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white/5 text-ink-dim hover:text-white"
              }`}
            >
              All ({notes.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-white/5 text-ink-dim hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Note List Cards */}
          <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1">
            {filteredNotes.length === 0 ? (
              <Card className="p-6 text-center text-xs text-ink-faint">
                No notes found matching your search.
              </Card>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === activeNote?.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedId(note.id);
                      setMobileDetailView(true);
                    }}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white/6 border-[var(--color-accent)]/50 shadow-md ring-1 ring-[var(--color-accent)]/20"
                        : "bg-[var(--color-card)]/50 border-[var(--color-edge)] hover:bg-white/4 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {note.pinned && (
                          <Pin className="h-3 w-3 text-amber-400 shrink-0 fill-amber-400/20" />
                        )}
                        <h4 className="text-xs font-semibold text-ink truncate">
                          {note.title || "Untitled Note"}
                        </h4>
                      </div>
                      <span className="text-[9px] text-ink-faint font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
                        {note.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-ink-dim line-clamp-2 leading-relaxed mb-2">
                      {note.content.replace(/^#+.*$/gm, "").trim() || "No content yet..."}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-ink-faint pt-1 border-t border-white/5">
                      <span>{new Date(note.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleTogglePin(note.id, e)}
                          className="p-1 hover:text-amber-400 transition-colors"
                          title={note.pinned ? "Unpin" : "Pin note"}
                        >
                          {note.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Content Editor / Reader ── */}
        <div
          className={`lg:col-span-8 flex flex-col ${
            !mobileDetailView ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeNote ? (
            <Card className="flex flex-col flex-1 p-4 sm:p-6 bg-[var(--color-card)]/80 border-[var(--color-edge)]">
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-edge)] mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileDetailView(false)}
                    className="lg:hidden h-7 px-2 text-xs text-ink-faint"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                  </Button>
                  <span className="text-[10px] text-ink-faint">
                    Last edited {new Date(activeNote.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(activeNote.id)}
                    className={`h-7 px-2 text-xs gap-1 ${activeNote.pinned ? "text-amber-400" : "text-ink-faint"}`}
                    title={activeNote.pinned ? "Pinned to top" : "Pin note"}
                  >
                    <Pin className="h-3 w-3" />
                    <span className="hidden sm:inline">{activeNote.pinned ? "Pinned" : "Pin"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyContent}
                    className="h-7 px-2 text-xs text-ink-faint hover:text-ink gap-1"
                    title="Copy full note"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadMarkdown}
                    className="h-7 px-2 text-xs text-ink-faint hover:text-ink gap-1"
                    title="Download as .md file"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteNote(activeNote.id, e)}
                    className="h-7 px-2 text-xs text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete note"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Title & Category Input Row */}
              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder="Note Title..."
                  className="w-full text-lg sm:text-xl font-bold text-ink bg-transparent outline-none placeholder:text-ink-faint"
                />
                <div className="flex items-center gap-2">
                  <Folder className="h-3 w-3 text-ink-faint" />
                  <input
                    type="text"
                    value={activeNote.category}
                    onChange={(e) => handleUpdateActiveNote({ category: e.target.value })}
                    placeholder="Category (e.g. Engineering & Security, Client, Operations)..."
                    className="text-xs text-ink-dim bg-transparent outline-none placeholder:text-ink-faint"
                  />
                </div>
              </div>

              {/* Note Content Textarea */}
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                placeholder="Start typing your note, SOP, checklist, or documentation here..."
                className="flex-1 w-full min-h-[440px] resize-none bg-transparent font-mono text-xs text-ink placeholder:text-ink-faint outline-none scrollbar-thin scrollbar-thumb-white/10 leading-relaxed"
              />
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center flex-1 p-8 text-center text-ink-faint">
              <StickyNote className="h-10 w-10 text-ink-faint/40 mb-3" />
              <p className="text-sm font-medium text-ink">No note selected</p>
              <p className="text-xs text-ink-dim mt-1">Select a note from the left or create a new one.</p>
              <Button onClick={handleCreateNote} className="mt-4 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                Create Note
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
