import { useState, useRef, useEffect, useCallback } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { buildContextBlock, updateContext } from "@/lib/ai-context";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Short-term memory: only the last N non-system messages are sent per request */
const MAX_HISTORY_MESSAGES = 10;

/**
 * Map native table names returned in the `mutatedTable` tool result hint
 * to the React Query cache keys used by dashboard pages.
 * Only tables whose pages use useQuery need to be listed here.
 */
const TABLE_TO_QUERY_KEY: Record<string, string> = {
  clients:          "clients",
  leads:            "leads",
  projects:         "projects",
  tasks:            "tasks",
  expenses:         "expenses",
  documents:        "documents",
  dynamic_records:  "dynamic_records",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a raw error (possibly raw JSON from an AI provider) into a
 * clean, user-readable string. The user should never see raw JSON.
 */
function extractUserFriendlyError(err: any): string {
  const raw: string = err?.message ?? String(err);

  // If the message looks like raw JSON (starts with '{'), try to parse it
  // and pull out just the human message portion.
  if (raw.trimStart().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      const inner  = parsed?.error?.message ?? parsed?.message;
      if (inner && typeof inner === "string") {
        // Strip the rate-limit upgrade CTA that Groq appends
        return inner.split(". Need more tokens?")[0];
      }
    } catch {
      // Not valid JSON — fall through to default below
    }
  }

  // Generic provider errors
  if (raw.includes("rate_limit_exceeded") || raw.includes("Rate limit")) {
    return "The AI is handling a lot of requests right now. Please wait a few seconds and try again.";
  }
  if (raw.includes("timeout")) {
    return "The AI took too long to respond. Please try again.";
  }
  if (raw.includes("All AI providers failed")) {
    return "All AI providers are temporarily unavailable. Please try again in a minute.";
  }

  return raw;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiAssistant() {
  const queryClient = useQueryClient();

  const [isOpen,     setIsOpen]     = useState(false);
  const [messages,   setMessages]   = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your duo-AI Business Assistant. How can I help you today?" },
  ]);
  const [input,      setInput]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Holds the AbortController for the current in-flight request
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom whenever messages change or window opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Cancel any in-flight request when the component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Cancel any previous in-flight request before starting a new one
    abortRef.current?.abort();
    const controller  = new AbortController();
    abortRef.current  = controller;

    try {
      // Build conversation: system prompt is set server-side,
      // so we only send the recent user/assistant history.
      // We prepend a lightweight context block to the placeholder system message
      // so the server can inject it at the top of the authoritative system prompt.
      const contextBlock  = buildContextBlock(window.location.pathname);
      const recentMessages = messages
        .filter((m) => m.role !== "system")
        .slice(-MAX_HISTORY_MESSAGES);

      const conversation = [
        {
          role:    "system",
          // The server overwrites this with its authoritative SYSTEM_PROMPT,
          // but it reads the `contextBlock` prefix from the first system message
          // to inject current-page / focused-entity context.
          content: contextBlock + "You are a helpful business assistant for DuoKarma Business Hub.",
        },
        ...recentMessages,
        userMsg,
      ];

      // Attach Supabase JWT when available (enables RLS-aware queries)
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch("/api/ai", {
        method:  "POST",
        signal:  controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: "chat", messages: conversation }),
      });

      // The refactored api/ai.ts always returns 200 with a choices[] structure.
      // Network failures (no connection, DNS failure) still throw.
      const data = await response.json();

      if (!response.ok) {
        // Unexpected non-200 — surface the error field if present
        throw new Error(data?.error ?? `Server error ${response.status}`);
      }

      const aiContent = data?.choices?.[0]?.message?.content;
      if (!aiContent) {
        throw new Error("Received an empty response from the AI.");
      }

      // ── Working memory + targeted cache invalidation ──────────────────────
      // `_context.touchedRecords` is the primary, reliable source:
      //   - Set by the server tool loop for search/insert/update operations.
      //   - Used to update the context manager AND invalidate specific caches.
      // Text-heuristic scan is the fallback for conversational turns with no tools.
      try {
        const touchedRecords: Array<{ id: string; name: string; table: string }> =
          data?._context?.touchedRecords ?? [];

        // Update lightweight working memory
        if (touchedRecords.length > 0) {
          updateContext(touchedRecords);
        }

        // Targeted cache invalidation from server hints
        const mutatedTables = new Set<string>(
          touchedRecords
            .map((r) => TABLE_TO_QUERY_KEY[r.table])
            .filter(Boolean)
        );

        // Fallback: heuristic text scan if server sent no hints
        if (mutatedTables.size === 0) {
          const lower = aiContent.toLowerCase();
          for (const [table, queryKey] of Object.entries(TABLE_TO_QUERY_KEY)) {
            if (lower.includes(table.replace("_", " ")) || lower.includes(table)) {
              mutatedTables.add(queryKey);
            }
          }
        }

        if (mutatedTables.size > 0) {
          for (const key of mutatedTables) {
            queryClient.invalidateQueries({ queryKey: [key] });
          }
        }
        // No invalidation needed for purely conversational turns
      } catch {
        // Never let context logic break the chat
        queryClient.invalidateQueries();
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiContent },
      ]);

    } catch (err: any) {
      // Ignore AbortError — user or unmount triggered the cancel
      if (err?.name === "AbortError") return;

      console.error("AI Error:", err);

      setMessages((prev) => [
        ...prev,
        {
          role:    "assistant",
          content: `❌ ${extractUserFriendlyError(err)}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, messages, queryClient]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[999] pointer-events-auto"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="h-14 w-14 rounded-full bg-electric text-ink shadow-[0_4px_24px_rgba(45,212,191,0.4)] hover:bg-electric/90 hover:scale-105 transition-transform"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[999] pointer-events-auto flex h-[500px] max-h-[80vh] w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-[var(--radius-panel)] border border-edge bg-[#0c0c0c] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-edge bg-graphite px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-electric/20 text-electric">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">duo-AI Assistant</h3>
                  <p className="text-[10px] text-ink-faint">Powered by duo-AI</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-ink-faint hover:text-ink hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-electric text-white rounded-br-sm"
                        : "bg-graphite text-ink rounded-bl-sm border border-edge"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-ink-faint mt-1 px-1">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-ink-faint mr-auto">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite border border-edge">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <span className="text-xs">Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-edge bg-graphite p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-void border-edge h-10"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 shrink-0 bg-electric text-black hover:bg-electric/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
