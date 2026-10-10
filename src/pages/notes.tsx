import { useState, useEffect, useMemo, useCallback } from "react";
import {
  StickyNote, Plus, Search, Trash2, Pin, PinOff,
  Copy, Check, Download, Folder, ChevronLeft,
  Pencil, Eye, Cloud, CheckCircle2, Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "local">("local");

  // Sync state to Supabase
  const syncToSupabase = useCallback(async (noteToSync: NoteItem) => {
    setIsSaving(true);
    setSyncStatus("saving");
    try {
      const { error } = await supabase.from("notes").upsert({
        id: noteToSync.id,
        title: noteToSync.title,
        category: noteToSync.category,
        content: noteToSync.content,
        pinned: noteToSync.pinned,
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        setSyncStatus("synced");
      } else {
        // Table may not exist yet or network error -> fallback to local
        setSyncStatus("local");
      }
    } catch {
      setSyncStatus("local");
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Fetch initial notes from Supabase
  useEffect(() => {
    async function loadSupabaseNotes() {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("pinned", { ascending: false })
          .order("updated_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: NoteItem[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            category: d.category || "General",
            content: d.content || "",
            pinned: Boolean(d.pinned),
            updatedAt: d.updated_at || new Date().toISOString(),
          }));
          setNotes(mapped);
          setSyncStatus("synced");
          if (!selectedId && mapped[0]) {
            setSelectedId(mapped[0].id);
          }
        } else if (!error && data && data.length === 0) {
          // Empty table: seed default notes
          for (const def of DEFAULT_NOTES) {
            await supabase.from("notes").upsert({
              id: def.id,
              title: def.title,
              category: def.category,
              content: def.content,
              pinned: def.pinned,
              updated_at: def.updatedAt,
            });
          }
          setSyncStatus("synced");
        } else {
          // Table doesn't exist yet -> keep local notes
          setSyncStatus("local");
        }
      } catch {
        setSyncStatus("local");
      }
    }
    loadSupabaseNotes();
  }, []);

  // Sync notes to localStorage cache
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

  const handleCreateNote = async () => {
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
    setIsEditing(true);
    setMobileDetailView(true);
    await syncToSupabase(newNote);
    toast({
      title: "New note created",
      description: "Give your note a title and start jotting down thoughts.",
    });
  };

  const handleUpdateActiveNote = (fields: Partial<NoteItem>) => {
    if (!activeNote) return;
    const updated = {
      ...activeNote,
      ...fields,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? updated : n))
    );
  };

  const handleSaveActiveNote = async () => {
    if (!activeNote) return;
    await syncToSupabase(activeNote);
    setIsEditing(false);
    toast({
      title: "Note Saved",
      description: syncStatus === "synced" 
        ? "Note changes saved to Supabase." 
        : "Note saved locally (run migration in Supabase SQL editor to sync to cloud).",
    });
  };

  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
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
    setIsEditing(false);

    try {
      await supabase.from("notes").delete().eq("id", id);
    } catch {}

    toast({
      title: "Note deleted",
      description: "Note removed from workspace.",
    });
  };

  const handleTogglePin = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned, updatedAt: new Date().toISOString() };
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? updated : n))
    );
    await syncToSupabase(updated);
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
          <div className="flex items-center gap-2">
            {syncStatus === "synced" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                <Cloud className="h-3.5 w-3.5" />
                Supabase Connected
              </span>
            )}
            <Button onClick={handleCreateNote} className="gap-1.5 text-xs touch-manipulation font-medium">
              <Plus className="h-3.5 w-3.5" />
              New Note
            </Button>
          </div>
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
              className="h-8 px-2.5 gap-1 text-xs shrink-0 touch-manipulation"
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
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 touch-manipulation ${
                selectedCategory === "all"
                  ? "bg-white/15 text-white border border-white/20 shadow-sm"
                  : "bg-white/5 text-ink-dim hover:text-white"
              }`}
            >
              All ({notes.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 touch-manipulation ${
                  selectedCategory === cat
                    ? "bg-white/15 text-white border border-white/20 shadow-sm"
                    : "bg-white/5 text-ink-dim hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Note List Items (Static crisp cards, no 3D tilt jitter) */}
          <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1">
            {filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-edge)] bg-[var(--color-card)]/50 p-6 text-center text-xs text-ink-faint">
                No notes found matching your search.
              </div>
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
                    className={`rounded-xl border p-3 cursor-pointer transition-all touch-manipulation ${
                      isSelected
                        ? "bg-white/[0.08] border-white/25 shadow-md ring-1 ring-white/10"
                        : "bg-[var(--color-card)]/60 border-[var(--color-edge)] hover:bg-white/[0.04] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {note.pinned && (
                          <Pin className="h-3 w-3 text-amber-400 shrink-0 fill-amber-400" />
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
                          type="button"
                          onClick={(e) => handleTogglePin(note.id, e)}
                          className="p-1 hover:text-amber-400 transition-colors touch-manipulation"
                          title={note.pinned ? "Unpin" : "Pin note"}
                        >
                          {note.pinned ? <PinOff className="h-3 w-3 text-amber-400" /> : <Pin className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 hover:text-rose-400 transition-colors touch-manipulation"
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

        {/* ── Right Content Editor / Reader Panel (Static crisp surface, zero 3D tilt blur) ── */}
        <div
          className={`lg:col-span-8 flex flex-col ${
            !mobileDetailView ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeNote ? (
            <div className="flex flex-col flex-1 p-4 sm:p-6 bg-[#111114]/95 border border-[var(--color-edge)] rounded-xl shadow-lg relative transform-none">
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-edge)] mb-4 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileDetailView(false)}
                    className="lg:hidden h-7 px-2 text-xs text-ink-faint touch-manipulation"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                  </Button>
                  <span className="text-[10px] text-ink-faint">
                    Last edited {new Date(activeNote.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {syncStatus === "synced" && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Cloud Saved
                    </span>
                  )}
                  {syncStatus === "saving" && (
                    <span className="text-[10px] text-amber-300 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </span>
                  )}
                </div>

                {/* Action Buttons: Razor sharp rendering without 3D tilt or filter blur */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Mode Switcher: Preview vs Edit */}
                  <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 mr-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className={`h-6 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors touch-manipulation ${
                        !isEditing
                          ? "bg-white/15 text-white font-semibold shadow-sm"
                          : "text-ink-faint hover:text-white"
                      }`}
                      title="View formatted note"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className={`h-6 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors touch-manipulation ${
                        isEditing
                          ? "bg-white/15 text-white font-semibold shadow-sm"
                          : "text-ink-faint hover:text-white"
                      }`}
                      title="Edit note title and content"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Save to Supabase Button (when in edit mode) */}
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={handleSaveActiveNote}
                      disabled={isSaving}
                      className="h-7 px-2.5 text-xs bg-white text-black hover:bg-white/90 font-medium gap-1 touch-manipulation shadow-sm"
                      title="Save note to Supabase"
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
                      <span>Save</span>
                    </Button>
                  )}

                  {/* Razor Sharp Pin Button (Never Blurs) */}
                  <button
                    type="button"
                    onClick={() => handleTogglePin(activeNote.id)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors touch-manipulation cursor-pointer ${
                      activeNote.pinned
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-ink-faint hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                    title={activeNote.pinned ? "Pinned to top" : "Pin note to top"}
                  >
                    <Pin className={`h-3.5 w-3.5 shrink-0 ${activeNote.pinned ? "fill-amber-400 text-amber-400" : "text-ink-faint"}`} />
                    <span className="hidden sm:inline font-medium">{activeNote.pinned ? "Pinned" : "Pin"}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="h-7 px-2 text-xs text-ink-faint hover:text-ink hover:bg-white/5 rounded-md inline-flex items-center gap-1 transition-colors touch-manipulation cursor-pointer"
                    title="Copy full note"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="h-7 px-2 text-xs text-ink-faint hover:text-ink hover:bg-white/5 rounded-md inline-flex items-center gap-1 transition-colors touch-manipulation cursor-pointer"
                    title="Download as .md file"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNote(activeNote.id, e)}
                    className="h-7 px-2 text-xs text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-md inline-flex items-center transition-colors touch-manipulation cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* ══════════════ EDIT MODE ══════════════ */}
              {isEditing ? (
                <div className="flex flex-col flex-1 space-y-3.5">
                  {/* Note Title Input with prominent edit styling */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/80 flex items-center justify-between">
                      <span>Note Title</span>
                      <span className="text-[10px] text-amber-400/80 font-normal">Editing title</span>
                    </label>
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                      placeholder="e.g. System & Security Hardening Checklist"
                      className="w-full text-base sm:text-lg font-bold text-white bg-black/40 border border-white/15 focus:border-[#C9A876] focus:ring-1 focus:ring-[#C9A876]/40 rounded-lg px-3.5 py-2 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>

                  {/* Category Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/80">Category</label>
                    <div className="relative">
                      <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
                      <input
                        type="text"
                        value={activeNote.category}
                        onChange={(e) => handleUpdateActiveNote({ category: e.target.value })}
                        placeholder="e.g. Engineering & Security, Client Policy, Operations"
                        className="w-full text-xs text-ink bg-black/40 border border-white/15 focus:border-[#C9A876] focus:ring-1 focus:ring-[#C9A876]/40 rounded-lg pl-9 pr-3 py-2 outline-none transition-all placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div className="space-y-1 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white/80">
                      <span>Note Content & Checklist</span>
                      <span className="text-[10px] text-ink-faint font-mono">
                        {activeNote.content.length} characters &bull; {activeNote.content.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      value={activeNote.content}
                      onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                      placeholder="Type your notes, checklist items, policies, or documentation..."
                      className="flex-1 w-full min-h-[380px] sm:min-h-[460px] p-3.5 font-mono text-xs text-ink bg-black/40 border border-white/15 focus:border-[#C9A876] focus:ring-1 focus:ring-[#C9A876]/40 rounded-lg outline-none leading-relaxed resize-none scrollbar-thin scrollbar-thumb-white/10"
                    />
                  </div>

                  {/* Save Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-ink-faint">
                      Changes auto-sync locally. Click Save to push to Supabase backend.
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-xs h-8 text-ink-faint hover:text-white"
                      >
                        Preview
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveActiveNote}
                        disabled={isSaving}
                        className="text-xs h-8 bg-white text-black hover:bg-white/90 font-medium px-4 shadow-sm"
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Cloud className="h-3 w-3 mr-1" />}
                        Save to Supabase
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ══════════════ PREVIEW / READING MODE ══════════════ */
                <div className="flex flex-col flex-1 space-y-4 overflow-y-auto max-h-[700px] pr-1">
                  {/* Title & Metadata Banner */}
                  <div className="space-y-1.5 pb-3 border-b border-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {activeNote.title || "Untitled Note"}
                      </h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="h-7 text-xs border-white/15 bg-white/5 hover:bg-white/10 text-white shrink-0 gap-1 touch-manipulation"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit Note
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-dim">
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-dim px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        <Folder className="h-3 w-3 text-ink-faint" />
                        {activeNote.category}
                      </span>
                    </div>
                  </div>

                  {/* Formatted Markdown Content Reader */}
                  <div className="font-mono text-xs leading-relaxed text-ink space-y-2.5 whitespace-pre-wrap select-text">
                    {activeNote.content ? (
                      activeNote.content.split("\n").map((line, idx) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h3 key={idx} className="font-sans text-lg font-bold text-white pt-2 pb-1 border-b border-white/10">
                              {line.replace("# ", "")}
                            </h3>
                          );
                        }
                        if (line.startsWith("### ")) {
                          return (
                            <h4 key={idx} className="font-sans text-sm font-semibold text-amber-300 pt-2 pb-0.5">
                              {line.replace("### ", "")}
                            </h4>
                          );
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h4 key={idx} className="font-sans text-base font-semibold text-white pt-2 pb-0.5">
                              {line.replace("## ", "")}
                            </h4>
                          );
                        }
                        if (line.trim() === "---") {
                          return <hr key={idx} className="border-white/10 my-2" />;
                        }
                        if (line.startsWith("- **")) {
                          return (
                            <div key={idx} className="text-white/95 font-medium pl-2 border-l-2 border-[#C9A876]/40 my-1">
                              {line}
                            </div>
                          );
                        }
                        if (line.startsWith("  → ")) {
                          return (
                            <div key={idx} className="text-ink-faint pl-4 italic text-[11px]">
                              {line}
                            </div>
                          );
                        }
                        return <div key={idx} className="text-ink-dim">{line || "\u00A0"}</div>;
                      })
                    ) : (
                      <div className="py-12 text-center text-ink-faint">
                        <p>This note is empty.</p>
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="mt-3 text-xs gap-1"
                        >
                          <Pencil className="h-3 w-3" /> Start Writing
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-edge)] bg-[var(--color-card)]/50 flex flex-col items-center justify-center flex-1 p-8 text-center text-ink-faint">
              <StickyNote className="h-10 w-10 text-ink-faint/40 mb-3" />
              <p className="text-sm font-medium text-ink">No note selected</p>
              <p className="text-xs text-ink-dim mt-1">Select a note from the left or create a new one.</p>
              <Button onClick={handleCreateNote} className="mt-4 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                Create Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
