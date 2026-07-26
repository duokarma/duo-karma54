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
          gap: 28px;
          align-items: start;
          box-sizing: border-box;
          width: 100%;
        }
        @media (max-width: 1100px) {
          .conv-layout-grid {
            grid-template-columns: 1fr;
          }
        }
        .conv-right-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 340px;
          min-width: 340px;
          box-sizing: border-box;
        }
        @media (max-width: 1100px) {
          .conv-right-panel {
            width: 100%;
            min-width: 0;
          }
        }
        .conv-right-panel input,
        .conv-right-panel select,
        .conv-right-panel button {
          box-sizing: border-box;
          width: 100%;
          display: block;
        }
        .conv-right-card {
          border-radius: 20px;
          padding: 28px 24px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .conv-field-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
          opacity: 0.55;
        }
        .conv-input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .conv-cta-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          padding: 14px 18px;
          border-radius: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.18s;
        }
        .conv-cta-btn:hover { opacity: 0.82; }
        .chat-scroll-area::-webkit-scrollbar { width: 5px; }
        .chat-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
        }
      `}</style>
      <div className="conv-layout-grid">
        
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
        <div className="conv-right-panel">

          {/* ── Get a Proposal Card ── */}
          <div className="conv-right-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: themeColor,
                background: `${themeColor}18`,
                padding: '3px 10px',
                borderRadius: 20,
              }}>Free Consultation</span>
            </div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 22,
              fontWeight: 400,
              color: COLORS.text,
              margin: '12px 0 8px',
              lineHeight: 1.25,
            }}>
              Get a Custom Proposal
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              lineHeight: 1.6,
              color: COLORS.secondary,
              margin: '0 0 22px',
            }}>
              Share your details and we'll send a tailored software proposal within 24 hours.
            </p>

            {leadSubmitted ? (
              <div style={{
                background: `${themeColor}15`,
                border: `1px solid ${themeColor}40`,
                borderRadius: 16,
                padding: '22px 18px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: `${themeColor}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Check size={22} color={themeColor} />
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  Proposal Request Sent!
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary }}>
                  We'll get back to you within 24 hours.
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div className="conv-field-label" style={{ color: COLORS.secondary }}>Your Name</div>
                  <input
                    className="conv-input"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    style={{
                      background: COLORS.bg,
                      border: `1px solid ${COLORS.line}`,
                      color: COLORS.text,
                    }}
                  />
                </div>
                <div>
                  <div className="conv-field-label" style={{ color: COLORS.secondary }}>Work Email</div>
                  <input
                    className="conv-input"
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    style={{
                      background: COLORS.bg,
                      border: `1px solid ${COLORS.line}`,
                      color: COLORS.text,
                    }}
                  />
                </div>
                <div>
                  <div className="conv-field-label" style={{ color: COLORS.secondary }}>Business Type</div>
                  <select
                    className="conv-input"
                    value={leadForm.businessType}
                    onChange={(e) => setLeadForm({ ...leadForm, businessType: e.target.value })}
                    style={{
                      background: COLORS.bg,
                      border: `1px solid ${COLORS.line}`,
                      color: COLORS.text,
                    }}
                  >
                    <option value="Salon">💈 Salon / Beauty Parlour</option>
                    <option value="Clinic">🏥 Medical Clinic</option>
                    <option value="Gym">🏋️ Gym / Fitness Studio</option>
                    <option value="Restaurant">🍽️ Restaurant / Cafe</option>
                    <option value="Farmhouse">🌿 Farmhouse / Event Venue</option>
                    <option value="Enterprise">⚡ Other Business</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  style={{
                    padding: '15px',
                    borderRadius: 14,
                    border: 'none',
                    background: themeColor,
                    color: '#15130F',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isSubmittingLead ? 'not-allowed' : 'pointer',
                    marginTop: 2,
                    letterSpacing: '0.01em',
                    opacity: isSubmittingLead ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {isSubmittingLead ? 'Sending...' : '→  Request Free Proposal'}
                </button>
              </form>
            )}
          </div>

          {/* ── Strategy Call Card ── */}
          <div className="conv-right-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 19,
              fontWeight: 400,
              color: COLORS.text,
              marginBottom: 6,
              lineHeight: 1.3,
            }}>
              Prefer a quick call?
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: COLORS.secondary,
              lineHeight: 1.6,
              margin: '0 0 18px',
            }}>
              Book a free 20-min strategy session — no pressure, just clarity.
            </p>

            {/* Google Meet CTA */}
            <a
              href="https://calendar.app.google/ycwYzWhqVRR6ZB3R9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 14,
                background: `${themeColor}12`,
                border: `1.5px solid ${themeColor}50`,
                textDecoration: 'none',
                marginBottom: 10,
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 38, height: 38, flexShrink: 0,
                borderRadius: 10,
                background: `${themeColor}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar size={18} color={themeColor} />
              </div>
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  color: themeColor,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}>Google Meet</div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.text,
                }}>Schedule Strategy Call</div>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919313846266"
              target="_blank"
              rel="noopener noreferrer"
              className="conv-cta-btn"
              style={{
                border: `1px solid ${COLORS.line}`,
                background: COLORS.bg,
                color: COLORS.text,
                marginBottom: 8,
              }}
            >
              <MessageCircle size={17} color='#25D366' />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>WhatsApp</div>
                <div style={{ fontSize: 11, color: COLORS.secondary, marginTop: 1 }}>+91 93138 46266</div>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:duokarma54@gmail.com"
              className="conv-cta-btn"
              style={{
                border: `1px solid ${COLORS.line}`,
                background: COLORS.bg,
                color: COLORS.text,
              }}
            >
              <Mail size={17} color={COLORS.secondary} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Email Us</div>
                <div style={{ fontSize: 11, color: COLORS.secondary, marginTop: 1 }}>duokarma54@gmail.com</div>
              </div>
            </a>
          </div>

        </div>

      </div>
    </>
  );
}
