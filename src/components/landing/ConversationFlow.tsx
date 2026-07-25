import React, { useState, useEffect, useRef } from 'react';
import { m as motion } from 'framer-motion';
import { Send, Sparkles, Calendar, MessageCircle, Mail, Check, RefreshCw, Bot } from 'lucide-react';
import { COLORS } from './ui/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_PROMPTS = [
  '💈 Salon Booking System',
  '🏥 Clinic Management Software',
  '🏋️ Gym & Member Tracking',
  '💰 Pricing & Timelines',
  '⚡ Custom Web App Development',
];

// Render basic markdown: **bold**, *italic*, newlines → <br>
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 4px' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'block' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export function ConversationFlow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: "👋 Hi! I'm the **DuoKarma Gemini AI Assistant**.\n\nI can help you explore custom software, automated booking systems, admin dashboards, or answer any questions about your upcoming project.\n\nWhat type of business do you run, or how can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Lead Form state
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', businessType: 'Salon' });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const themeColor = COLORS.accent || '#F4C073';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = await response.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.text || data.error || 'Sorry, I had trouble processing that request. Please try again!',
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Oops! Unable to connect to Gemini AI right now. Please check your connection or try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    setIsSubmittingLead(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('website_inquiries').insert({
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        business_type: leadForm.businessType,
        source: 'Gemini AI Assistant',
        status: 'new',
        lead_score: 50,
      });
      setLeadSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        text: "👋 Hi! I'm the **DuoKarma Gemini AI Assistant**.\n\nI can help you explore custom software, automated booking systems, admin dashboards, or answer any questions about your upcoming project.\n\nWhat type of business do you run, or how can I help you today?",
      },
    ]);
  };

  return (
    <>
      <style>{`
        .conv-layout-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
        }
        @media (max-width: 900px) {
          .conv-layout-grid {
            grid-template-columns: 1fr;
          }
        }
        .chat-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
      `}</style>
      <div className="conv-layout-grid" style={{ gap: 32, alignItems: 'start' }}>
        
        {/* ── Left: Gemini AI Interactive Chat ── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 24,
          padding: '28px 28px 32px',
          minHeight: 620,
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* AI Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `1px solid ${COLORS.line}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: `${themeColor}20`,
                border: `1px solid ${themeColor}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeColor
              }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  DuoKarma AI Assistant
                  <span style={{ fontSize: 11, background: `${themeColor}25`, color: themeColor, padding: '2px 8px', borderRadius: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Gemini 2.5
                  </span>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary }}>
                  Online • Real-time AI Software Consultant
                </div>
              </div>
            </div>

            <button
              onClick={resetChat}
              title="Reset Chat"
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.line}`,
                borderRadius: 10,
                padding: '8px',
                color: COLORS.secondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <RefreshCw size={14} /> Clear
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 12 }}>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: `1px solid ${COLORS.line}`,
                  background: COLORS.bg,
                  color: COLORS.text,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = themeColor;
                  e.currentTarget.style.color = themeColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = COLORS.line;
                  e.currentTarget.style.color = COLORS.text;
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="chat-scroll-area" style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: 400,
            paddingRight: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 10,
                }}
              >
                {m.role === 'assistant' && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `${themeColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: themeColor,
                    marginTop: 4
                  }}>
                    <Bot size={18} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    padding: '14px 18px',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    background: m.role === 'user' ? themeColor : COLORS.surface2,
                    color: m.role === 'user' ? '#15130F' : COLORS.text,
                    border: m.role === 'user' ? 'none' : `1px solid ${COLORS.line}`,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: m.role === 'user' ? 500 : 400,
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                />
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `${themeColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: themeColor
                }}>
                  <Bot size={18} />
                </div>
                <div style={{
                  background: COLORS.surface2,
                  border: `1px solid ${COLORS.line}`,
                  padding: '10px 16px',
                  borderRadius: '4px 18px 18px 18px',
                }}>
                  <TypingDots color={themeColor} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${COLORS.line}` }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gemini about custom software, pricing, or ideas..."
                disabled={isTyping}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: COLORS.bg,
                  border: `1.5px solid ${COLORS.line}`,
                  color: COLORS.text,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={isTyping || !input.trim()}
                style={{
                  padding: '16px 22px',
                  borderRadius: 16,
                  border: 'none',
                  background: themeColor,
                  color: '#15130F',
                  fontWeight: 600,
                  cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isTyping || !input.trim() ? 0.6 : 1,
                }}
              >
                <Send size={18} />
              </motion.button>
            </form>
          </div>

        </div>

        {/* ── Right: Action & Booking Pane ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Quick Lead Form Card */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 24, padding: 28 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: COLORS.text, marginBottom: 8 }}>
              Get a Proposal
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary, marginBottom: 18 }}>
              Ready to turn your idea into custom software? Share your details and we'll send a customized proposal.
            </p>

            {leadSubmitted ? (
              <div style={{ background: `${themeColor}15`, border: `1px solid ${themeColor}`, borderRadius: 14, padding: 18, textAlign: 'center' }}>
                <Check size={28} color={themeColor} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.text }}>
                  Request Received!
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary, marginTop: 4 }}>
                  We will get back to you within 24 hours.
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.line}`,
                    color: COLORS.text,
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <input
                  type="email"
                  placeholder="Work Email"
                  required
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.line}`,
                    color: COLORS.text,
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <select
                  value={leadForm.businessType}
                  onChange={(e) => setLeadForm({ ...leadForm, businessType: e.target.value })}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.line}`,
                    color: COLORS.text,
                    fontSize: 14,
                    outline: 'none',
                  }}
                >
                  <option value="Salon">Salon</option>
                  <option value="Clinic">Medical Clinic</option>
                  <option value="Gym">Gym / Fitness</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Farmhouse">Farmhouse</option>
                  <option value="Enterprise">Other Enterprise</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    border: 'none',
                    background: themeColor,
                    color: '#15130F',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  {isSubmittingLead ? 'Sending...' : 'Request Detailed Proposal'}
                </button>
              </form>
            )}
          </div>

          {/* Instant Call CTA */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 24, padding: 28 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>
              Prefer a 1-on-1 strategy call?
            </div>

            <a
              href="https://calendar.app.google/ycwYzWhqVRR6ZB3R9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '16px 20px',
                borderRadius: 16,
                background: COLORS.bg,
                border: `1.5px solid ${themeColor}`,
                textDecoration: 'none',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <Calendar size={18} color={themeColor} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: themeColor, letterSpacing: '0.05em' }}>
                  GOOGLE MEET
                </span>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: COLORS.text }}>
                Schedule Strategy Call
              </div>
            </a>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a
                href="https://wa.me/919313846266"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.line}`,
                  background: COLORS.bg,
                  color: COLORS.text,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={15} color={COLORS.secondary} /> WhatsApp
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=duokarma54@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.line}`,
                  background: COLORS.bg,
                  color: COLORS.text,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <Mail size={15} color={COLORS.secondary} /> Email
              </a>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
