import { useState, useRef, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your duo-AI Business Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build the message history to send to Gemini
      const conversation = [
        { role: "system", content: "You are a helpful business assistant for DuoKarma Business Hub. Keep your answers concise, professional, and formatted nicely." },
        ...messages.filter(m => m.role !== "system"),
        userMsg
      ];

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/ai', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ action: "chat", messages: conversation }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      const aiResponse = data.choices[0].message.content || "Hmm, I tried to process that but something went wrong. Let's try again.";
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err: any) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${err.message || "Failed to connect to AI."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
