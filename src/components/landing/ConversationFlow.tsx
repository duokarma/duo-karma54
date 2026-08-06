import React, { useState, useRef, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, MessageCircle, Mail, Calendar, RefreshCw, Sparkles, ClipboardList, ChevronRight } from 'lucide-react';
import { COLORS } from './ui/theme';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

type ActiveTab = 'ai' | 'lead';

type LeadStep = 'name' | 'email' | 'phone' | 'business' | 'project' | 'done';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  project: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  '💈 Salon Booking System',
  '🏥 Clinic Management Software',
  '🏋️ Gym & Member Tracking',
  '💰 Pricing & Timelines',
  '⚡ Custom Web App Development',
];

const BUSINESS_OPTIONS = [
  { value: 'Salon', label: '💈 Salon / Beauty' },
  { value: 'Clinic', label: '🏥 Medical Clinic' },
  { value: 'Gym', label: '🏋️ Gym / Fitness' },
  { value: 'Restaurant', label: '🍽️ Restaurant / Cafe' },
  { value: 'Farmhouse', label: '🌿 Farmhouse / Venue' },
  { value: 'Other', label: '⚡ Other Business' },
];

const AI_INIT_MESSAGE: Message = {
  id: 'ai-init',
  role: 'assistant',
  text: "👋 Hi! I'm the **DuoKarma AI Assistant**.\n\nI can answer questions about our services, pricing, timelines, or help you figure out what software fits your business best.\n\nWhat would you like to know?",
};

const LEAD_BOT_QUESTIONS: Record<LeadStep, string> = {
  name: "👋 Welcome! I'm here to help you get a **custom proposal**.\n\nLet's start — **what's your name?**",
  email: "Great, {name}! 📧 What's your **work email address?** _(Type 'skip' to skip this)_",
  phone: "Perfect! 📱 What's your **WhatsApp / phone number?** We'll use this to contact you.",
  business: "Thanks! Now, **what type of business do you run?**",
  project: "Awesome! 💡 Finally — **briefly describe what you need**, or what your biggest challenge is right now.",
  done: "🎉 **Thank you, {name}!** We've received your request and will send a tailored proposal to **{email}** within 24 hours.\n\nYou can also book a free 20-min strategy call using the button below!",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'block' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const ChatBubble = ({ msg, accentColor }: { msg: Message; accentColor: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      display: 'flex',
      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 10,
      marginBottom: 16,
    }}
  >
    {msg.role === 'assistant' && (
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: `${accentColor}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="/ai-brain.png" alt="AI Brain" style={{ width: 20, height: 20, objectFit: 'contain' }} />
      </div>
    )}
    <div
      style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        background: msg.role === 'user' ? accentColor : COLORS.surface,
        border: msg.role === 'user' ? 'none' : `1px solid ${COLORS.line}`,
        color: msg.role === 'user' ? '#15130F' : COLORS.text,
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        lineHeight: 1.6,
      }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
    />
  </motion.div>
);

const ChatGlobalStyles = React.memo(() => (
  <style>{`
    .dk-scroll::-webkit-scrollbar { width: 4px; }
    .dk-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .dk-input { background: transparent; border: none; outline: none; flex: 1; min-width: 0; font-family: 'Inter', sans-serif; font-size: 14px; color: ${COLORS.text}; }
    .dk-input::placeholder { color: ${COLORS.secondary}; opacity: 0.6; }
    .dk-send-btn { width: 40px; height: 40px; border-radius: 12px; border: none; background: ${COLORS.accent || '#F4C073'}; color: #15130F; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s; }
    .dk-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .prompt-chip { padding: 7px 14px; border-radius: 20px; border: 1px solid ${COLORS.line}; background: ${COLORS.surface}; color: ${COLORS.secondary}; font-family: 'Inter', sans-serif; font-size: 12px; cursor: pointer; white-space: nowrap; transition: border-color 0.2s, color 0.2s; }
    .prompt-chip:hover { border-color: ${COLORS.accent || '#F4C073'}; color: ${COLORS.accent || '#F4C073'}; }
    .biz-chip { padding: 8px 14px; border-radius: 20px; border: 1px solid ${COLORS.line}; background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Inter', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .biz-chip:hover { border-color: ${COLORS.accent || '#F4C073'}; background: ${COLORS.accent || '#F4C073'}20; color: ${COLORS.accent || '#F4C073'}; }
  `}</style>
));

export function ConversationFlow() {
  const themeColor = COLORS.accent || '#F4C073';

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<Message[]>([AI_INIT_MESSAGE]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Lead Bot state
  const [leadMessages, setLeadMessages] = useState<Message[]>([
    { id: 'lead-init', role: 'assistant', text: LEAD_BOT_QUESTIONS.name },
  ]);
  const [leadInput, setLeadInput] = useState('');
  const [leadStep, setLeadStep] = useState<LeadStep>('name');
  const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '', businessType: '', project: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadDone, setLeadDone] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('ai');

  const aiEndRef = useRef<HTMLDivElement | null>(null);
  const leadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { 
    if (aiMessages.length > 1 || aiTyping) {
      aiEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [aiMessages, aiTyping]);
  
  useEffect(() => { 
    if (leadMessages.length > 1) {
      leadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [leadMessages]);

  // ── AI Chat handler ──────────────────────────────────────────────────────────

  const sendAiMessage = async (textToSend?: string) => {
    const query = (textToSend || aiInput).trim();
    if (!query || aiTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    if (!textToSend) setAiInput('');
    setAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      setAiMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.text || "Sorry, I had trouble with that. Please try again!",
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: "Connection issue — please try again!" },
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  // ── Lead Bot handler ─────────────────────────────────────────────────────────

  const sendLeadMessage = async (textOverride?: string) => {
    if (leadDone || leadStep === 'done') return;
    const text = (textOverride || leadInput).trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setLeadMessages((prev) => [...prev, userMsg]);
    setLeadInput('');

    const newData = { ...leadData };

    if (leadStep === 'name') {
      newData.name = text;
      setLeadData(newData);
      setLeadStep('email');
      setTimeout(() => {
        setLeadMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', text: LEAD_BOT_QUESTIONS.email.replace('{name}', text) },
        ]);
      }, 400);
    } else if (leadStep === 'email') {
      newData.email = text.toLowerCase() === 'skip' ? '' : text;
      setLeadData(newData);
      setLeadStep('phone');
      setTimeout(() => {
        setLeadMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', text: LEAD_BOT_QUESTIONS.phone },
        ]);
      }, 400);
    } else if (leadStep === 'phone') {
      const digitsOnly = text.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        setTimeout(() => {
          setLeadMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: 'assistant', text: 'Please enter a valid 10-digit phone number.' },
          ]);
        }, 400);
        return;
      }
      newData.phone = text;
      setLeadData(newData);
      setLeadStep('business');
      setTimeout(() => {
        setLeadMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', text: LEAD_BOT_QUESTIONS.business },
        ]);
      }, 400);
    } else if (leadStep === 'business') {
      newData.businessType = text;
      setLeadData(newData);
      setLeadStep('project');
      setTimeout(() => {
        setLeadMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', text: LEAD_BOT_QUESTIONS.project },
        ]);
      }, 400);
    } else if (leadStep === 'project') {
      newData.project = text;
      setLeadData(newData);
      setLeadStep('done');
      setLeadSubmitting(true);

      // Save to Supabase website_inquiries
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase.from('website_inquiries').insert({
          name: newData.name,
          email: newData.email,
          phone: newData.phone,
          business_type: newData.businessType,
          message: newData.project,
          source: 'DuoKarma AI Assistant',
          status: 'new',
          lead_score: 70,
        });
      } catch (err) {
        console.error('Failed to save inquiry:', err);
      } finally {
        setLeadSubmitting(false);
        setLeadDone(true);
        setLeadMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            text: LEAD_BOT_QUESTIONS.done
              .replace('{name}', newData.name)
              .replace('{email}', newData.email),
          },
        ]);
      }
    }
  };

  const resetLeadBot = () => {
    setLeadMessages([{ id: 'lead-init', role: 'assistant', text: LEAD_BOT_QUESTIONS.name }]);
    setLeadStep('name');
    setLeadData({ name: '', email: '', phone: '', businessType: '', project: '' });
    setLeadDone(false);
    setLeadSubmitting(false);
    setLeadInput('');
  };

  // ── Styles ───────────────────────────────────────────────────────────────────

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s',
    background: active ? themeColor : 'transparent',
    color: active ? '#15130F' : COLORS.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  });

  const chatAreaStyle: React.CSSProperties = {
    height: 340,
    overflowY: 'auto',
    padding: '20px 20px 4px',
    display: 'flex',
    flexDirection: 'column',
    scrollBehavior: 'smooth',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    padding: '16px 20px',
    borderTop: `1px solid ${COLORS.line}`,
    alignItems: 'center',
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <ChatGlobalStyles />

      {/* ── Main Chat Card ── */}
      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '18px 20px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${themeColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color={themeColor} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.text }}>
                DuoKarma AI Assistant
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.secondary }}>Online · Powered by DUO-KARMA</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: COLORS.bg,
            borderRadius: 16,
            padding: 4,
            gap: 4,
          }}>
            <button style={tabStyle(activeTab === 'ai')} onClick={() => setActiveTab('ai')}>
              <img src="/ai-brain.png" alt="AI Brain" style={{ width: 14, height: 14, objectFit: 'contain' }} />
              AI Chat
            </button>
            <button style={tabStyle(activeTab === 'lead')} onClick={() => setActiveTab('lead')}>
              <ClipboardList size={14} />
              Get a Quote
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'ai' ? (
            <motion.div key="ai-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* Suggested Prompts */}
              <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} className="prompt-chip" onClick={() => sendAiMessage(p)}>{p}</button>
                ))}
              </div>

              {/* AI Messages */}
              <div className="dk-scroll" style={chatAreaStyle}>
                {aiMessages.map((msg) => <ChatBubble key={msg.id} msg={msg} accentColor={themeColor} />)}
                {aiTyping && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src="/ai-brain.png" alt="AI Brain" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 18px 18px 18px', background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
                      <TypingDots color={themeColor} />
                    </div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>

              {/* AI Input */}
              <form style={inputRowStyle} onSubmit={(e) => { e.preventDefault(); sendAiMessage(); }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 14, padding: '10px 16px', gap: 8,
                  minWidth: 0,
                }}>
                  <input
                    className="dk-input"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask about pricing, services, or your project..."
                    disabled={aiTyping}
                  />
                </div>
                <button className="dk-send-btn" type="submit" disabled={aiTyping || !aiInput.trim()}>
                  <Send size={16} />
                </button>
                <button
                  type="button"
                  title="Reset chat"
                  onClick={() => setAiMessages([AI_INIT_MESSAGE])}
                  style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${COLORS.line}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <RefreshCw size={14} color={COLORS.secondary} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="lead-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* Lead Bot Messages */}
              <div className="dk-scroll" style={{ ...chatAreaStyle, paddingTop: 20 }}>
                {leadMessages.map((msg) => <ChatBubble key={msg.id} msg={msg} accentColor={themeColor} />)}
                {leadSubmitting && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.secondary, fontSize: 13, fontFamily: "'Inter', sans-serif", padding: '4px 0' }}>
                    <TypingDots color={themeColor} />
                    Saving your details...
                  </div>
                )}
                {/* Business type quick buttons */}
                {leadStep === 'business' && !leadDone && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {BUSINESS_OPTIONS.map((opt) => (
                      <button key={opt.value} className="biz-chip" onClick={() => sendLeadMessage(opt.value)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {leadDone && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <button
                      onClick={resetLeadBot}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 20,
                        border: `1px solid ${COLORS.line}`,
                        background: 'transparent', cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif", fontSize: 12,
                        color: COLORS.secondary,
                      }}
                    >
                      <RefreshCw size={12} /> Start a new request
                    </button>
                  </div>
                )}
                <div ref={leadEndRef} />
              </div>

              {/* Lead Bot Input */}
              {!leadDone && leadStep !== 'done' && (
                <form style={inputRowStyle} onSubmit={(e) => { e.preventDefault(); sendLeadMessage(); }}>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 14, padding: '10px 16px', gap: 8,
                    minWidth: 0,
                  }}>
                    <input
                      className="dk-input"
                      value={leadInput}
                      onChange={(e) => setLeadInput(e.target.value)}
                      placeholder={
                        leadStep === 'name' ? 'Your name...' :
                        leadStep === 'email' ? 'your@email.com... (or type skip)' :
                        leadStep === 'phone' ? '+91 ...' :
                        leadStep === 'business' ? 'Or type your business type...' :
                        'Describe your project...'
                      }
                    />
                  </div>
                  <button className="dk-send-btn" type="submit" disabled={!leadInput.trim()}>
                    <ChevronRight size={18} />
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Contact Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        width: '100%',
        boxSizing: 'border-box',
        marginTop: 16,
      }}>
        {/* Strategy Call */}
        <a
          href="https://calendar.app.google/ycwYzWhqVRR6ZB3R9"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '18px 20px',
            borderRadius: 18,
            background: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            textDecoration: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            width: 44, height: 44, flexShrink: 0, borderRadius: 12,
            background: `${themeColor}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar size={20} color={themeColor} />
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: themeColor, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Free · 20 min</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.text }}>Book a Strategy Call</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary, marginTop: 1 }}>Google Meet · No pressure</div>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/919313846266"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '18px 20px',
            borderRadius: 18,
            background: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            width: 44, height: 44, flexShrink: 0, borderRadius: 12,
            background: '#25D36620',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageCircle size={20} color="#25D366" />
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#25D366', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Instant reply</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.text }}>WhatsApp Us</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary, marginTop: 1 }}>+91 93138 46266</div>
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:duokarma54@gmail.com"
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '18px 20px',
            borderRadius: 18,
            background: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            width: 44, height: 44, flexShrink: 0, borderRadius: 12,
            background: `${COLORS.secondary}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mail size={20} color={COLORS.secondary} />
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.secondary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Send us a note</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.text }}>Email Us</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary, marginTop: 1 }}>duokarma54@gmail.com</div>
          </div>
        </a>
      </div>
    </>
  );
}
