import { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Calendar, MessageCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { COLORS } from './ui/theme';

// ─── Lead Scoring ────────────────────────────────────────────────────────────
function computeLeadScore(answers: Partial<Answers>): number {
  let score = 0;
  if (answers.branches === '2–5 Branches') score += 20;
  if (answers.branches === '5+ Branches') score += 40;
  if (answers.interestedIn === 'Admin Software') score += 25;
  if (answers.interestedIn === 'Booking System') score += 20;
  if (answers.timeline === 'Immediately') score += 30;
  if (answers.timeline === 'This Month') score += 15;
  return score;
}

// ─── Dynamic Themes & Content ──────────────────────────────────────────────
const THEMES: Record<string, string> = {
  'Salon': '#F4C073', // Warmer gold
  'Clinic': '#64B5F6', // Clean blue
  'Farmhouse': '#81C784', // Earthy green
  'Gym': '#FF8A65', // Energy orange
  'Restaurant': '#E57373', // Soft red
  'default': COLORS.accent,
};

const CONTEXT_PANEL: Record<string, string[]> = {
  'Salon': ['✓ Appointment System', '✓ Staff Management', '✓ Billing', '✓ Inventory'],
  'Clinic': ['✓ Patient Records', '✓ Appointment Scheduling', '✓ Secure Billing', '✓ Reminders'],
  'Farmhouse': ['✓ Online Booking', '✓ Payments', '✓ Availability Calendar', '✓ Admin Dashboard'],
  'Gym': ['✓ Member Management', '✓ Class Scheduling', '✓ Automated Billing', '✓ Progress Tracking'],
  'Restaurant': ['✓ Table Reservations', '✓ Digital Menus', '✓ Order Management', '✓ POS Integration'],
  'default': ['✓ Tailored Software', '✓ Modern Design', '✓ Automations', '✓ Dedicated Support'],
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface Answers {
  name: string;
  email: string;
  businessType: string;
  branches: string;
  interestedIn: string;
  challenge: string;
  timeline: string;
  phone: string;
}

type StepKey = keyof Answers | 'intro';

interface Step {
  key: StepKey;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'intro';
  question: (a: Partial<Answers>) => React.ReactNode;
  placeholder?: string;
  options?: string[];
  validate?: (val: string) => string | null;
}

const STEPS: Step[] = [
  {
    key: 'intro',
    type: 'intro',
    question: () => (
      <>
        Hi there.<br/><br/>
        I'll ask you a few quick questions so we can understand your project before our first call.<br/><br/>
        Ready?
      </>
    ),
  },
  {
    key: 'name',
    type: 'text',
    question: () => "What's your name?",
    placeholder: 'e.g. Raj Patel',
    validate: (v) => (v.trim().length < 2 ? 'Please enter your name' : null),
  },
  {
    key: 'businessType',
    type: 'select',
    question: (a) => `Nice meeting you, ${a.name?.split(' ')[0] || 'there'}. What type of business do you have?`,
    options: ['Salon', 'Farmhouse', 'Clinic', 'Gym', 'Restaurant', 'Other'],
  },
  {
    key: 'branches',
    type: 'select',
    question: () => 'How many branches do you operate?',
    options: ['1 Branch', '2–5 Branches', '5+ Branches'],
  },
  {
    key: 'interestedIn',
    type: 'select',
    question: () => "What are you primarily looking for?",
    options: ['Website', 'Admin Software', 'Booking System', 'CRM', 'Automation', 'Not Sure'],
  },
  {
    key: 'challenge',
    type: 'textarea',
    question: () => "What's the biggest challenge you're facing right now?",
    placeholder: 'e.g. Managing appointments, tracking revenue…',
    validate: (v) => (v.trim().length < 5 ? 'Please describe your challenge briefly' : null),
  },
  {
    key: 'timeline',
    type: 'select',
    question: () => 'When are you planning to start this project?',
    options: ['Immediately', '1–2 Weeks', 'This Month', '1–3 Months', 'Just Exploring'],
  },
  {
    key: 'email',
    type: 'email',
    question: () => "Where should we send the proposal?",
    placeholder: 'you@example.com',
    validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Please enter a valid email'),
  },
  {
    key: 'phone',
    type: 'tel',
    question: () => "And what's the best number to contact you?",
    placeholder: '9876543210',
    validate: (v) => (/^\+?[\d\s\-()]{7,15}$/.test(v.trim()) ? null : 'Please enter a valid phone number'),
  },
];

const STORAGE_KEY = 'dk_convo_draft_v2';
const TOTAL = STEPS.length - 1; // excluding intro from total count

// ─── Typing Animation ─────────────────────────────────────────────────────────
function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'block' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name, theme }: { name: string; theme: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ textAlign: 'center', padding: '40px 20px' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `${theme}15`,
          border: `2px solid ${theme}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <Check size={32} color={theme} />
      </motion.div>

      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 26, color: COLORS.text, marginBottom: 12 }}>
        Perfect, {name}.
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: COLORS.secondary, marginBottom: 36, lineHeight: 1.6 }}>
        Your project has been received.<br />
        We'll review everything before contacting you.<br/>
        Estimated response: <strong style={{ color: COLORS.text }}>Within 24 hours.</strong>
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <a
          href="https://calendar.app.google/ycwYzWhqVRR6ZB3R9"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 14,
            background: theme,
            color: '#15130F',
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Calendar size={18} /> Book a call
        </a>
        <a
          href="https://wa.me/919313846266"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '16px 28px',
            borderRadius: 14,
            border: `1.5px solid ${COLORS.line}`,
            background: 'transparent',
            color: COLORS.text,
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <MessageCircle size={18} /> WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ConversationFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);

  const currentStep = STEPS[step];
  const themeColor = answers.businessType ? THEMES[answers.businessType] || THEMES.default : THEMES.default;
  const currentContext = answers.businessType ? CONTEXT_PANEL[answers.businessType] || CONTEXT_PANEL.default : CONTEXT_PANEL.default;

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step: s, answers: a } = JSON.parse(saved);
        if (typeof s === 'number' && a) {
          setStep(s);
          setAnswers(a);
          const k = STEPS[s]?.key;
          if (k && k !== 'intro') {
            setCurrentInput((a as Answers)[k as keyof Answers] ?? '');
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist draft
  useEffect(() => {
    if (!isDone) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers }));
    }
  }, [step, answers, isDone]);

  // Typing animation & autofocus
  useEffect(() => {
    setIsTyping(true);
    setError(null);
    const delay = step === 0 ? 1200 : 800; // longer for intro
    const t = setTimeout(() => {
      setIsTyping(false);
      setTimeout(() => {
        if (step > 0 && !isInitialMount.current) {
          inputRef.current?.focus({ preventScroll: true });
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        isInitialMount.current = false;
      }, 50);
    }, delay);
    return () => clearTimeout(t);
  }, [step]);

  // Pre-fill input
  useEffect(() => {
    if (currentStep && currentStep.key !== 'intro') {
      setCurrentInput((answers[currentStep.key as keyof Answers] as string) ?? '');
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (currentStep.type === 'intro') {
      setStep(s => s + 1);
      return;
    }

    const val = currentInput.trim();
    if (currentStep.validate) {
      const err = currentStep.validate(val);
      if (err) { setError(err); return; }
    } else if (currentStep.type === 'select' && !val) {
      setError('Please select an option');
      return;
    }
    const updated = { ...answers, [currentStep.key]: val };
    setAnswers(updated);
    setCurrentInput('');
    setError(null);

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit(updated as Answers);
    }
  };

  const handleSelect = (option: string) => {
    setCurrentInput(option);
    setError(null);
    const updated = { ...answers, [currentStep.key]: option };
    setAnswers(updated);
    setTimeout(() => {
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
        setCurrentInput('');
      } else {
        handleSubmit(updated as Answers);
      }
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep.type !== 'textarea') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async (finalAnswers: Answers) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const since = new Date(Date.now() - 86_400_000).toISOString();
      const { data: existing } = await supabase
        .from('website_inquiries')
        .select('id')
        .eq('email', finalAnswers.email)
        .gte('created_at', since)
        .limit(1);

      if (existing && existing.length > 0) {
        setIsDone(true);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const leadScore = computeLeadScore(finalAnswers);
      const { error: insertError } = await supabase.from('website_inquiries').insert({
        name: finalAnswers.name,
        email: finalAnswers.email,
        phone: finalAnswers.phone,
        business_type: finalAnswers.businessType,
        branches: finalAnswers.branches,
        interested_in: finalAnswers.interestedIn,
        challenge: finalAnswers.challenge || null,
        timeline: finalAnswers.timeline,
        source: 'Website',
        status: 'new',
        lead_score: leadScore,
      });

      if (insertError) throw insertError;
      setIsDone(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again or email us at duokarma54@gmail.com");
      setIsSubmitting(false);
    }
  };

  const progressCount = Math.max(0, step); // 0 at intro
  const dots = Array.from({ length: TOTAL }).map((_, i) => (i < progressCount ? '●' : '○')).join('');

  if (isDone) {
    return (
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 24, padding: '40px 0' }}>
        <SuccessScreen name={answers.name?.split(' ')[0] ?? 'there'} theme={themeColor} />
      </div>
    );
  }

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
      `}</style>
      <div className="conv-layout-grid" style={{ 
        gap: 32, 
        alignItems: 'start',
      }}>
      
      {/* ── Left: Conversation ── */}
      <div style={{ 
        background: COLORS.surface, 
        border: `1px solid ${COLORS.line}`, 
        borderRadius: 24, 
        padding: '32px 32px 40px',
        minHeight: 560,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Progress Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: COLORS.text }}>01 Discover</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: themeColor, letterSpacing: '0.1em' }}>{dots}</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary }}>
            {progressCount === 0 ? 'Introduction' : `Step ${progressCount} of ${TOTAL}`}
          </div>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Intro Message is always shown first once step > 0 */}
          {step > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary, marginLeft: 44 }}>👋 DuoKarma Assistant</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  🤝
                </div>
                <div style={{ background: COLORS.surface2, border: `1px solid ${COLORS.line}`, padding: '14px 18px', borderRadius: '4px 16px 16px 16px', fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.text, lineHeight: 1.5 }}>
                  {STEPS[0].question({})}
                </div>
              </div>
            </div>
          )}

          {/* Previous Steps */}
          {STEPS.slice(1, step).map((s) => (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  🤝
                </div>
                <div style={{ background: COLORS.surface2, border: `1px solid ${COLORS.line}`, padding: '14px 18px', borderRadius: '4px 16px 16px 16px', fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.text, lineHeight: 1.5 }}>
                  {s.question(answers)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: themeColor, padding: '12px 18px', borderRadius: '16px 16px 4px 16px', fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#15130F', fontWeight: 500 }}>
                  {answers[s.key as keyof Answers]}
                </div>
              </div>
            </div>
          ))}

          {/* Current Step */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
             {step === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary, marginLeft: 44 }}>👋 DuoKarma Assistant</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                🤝
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step + '-bubble'}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: COLORS.surface2, border: `1px solid ${COLORS.line}`, padding: '14px 18px', borderRadius: '4px 16px 16px 16px', fontFamily: "'Inter', sans-serif", fontSize: 15, color: COLORS.text, lineHeight: 1.5, maxWidth: '90%' }}
                >
                  {isTyping ? <TypingDots color={themeColor} /> : currentStep.question(answers)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div ref={chatEndRef} />
        </div>

        {/* Current Input */}
        <div style={{ marginTop: 24, paddingTop: 16 }}>
          <AnimatePresence mode="wait">
            {!isTyping && (
              <motion.div
                key={step + '-input'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {currentStep.type === 'intro' ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    style={{
                      padding: '18px 24px',
                      borderRadius: 16,
                      border: 'none',
                      background: themeColor,
                      color: '#15130F',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      boxShadow: `0 4px 20px ${themeColor}20`
                    }}
                  >
                    Yes, let's start <ArrowRight size={18} />
                  </motion.button>
                ) : currentStep.type === 'select' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                    {currentStep.options!.map((opt) => (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(opt)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 14,
                          border: `1.5px solid ${currentInput === opt ? themeColor : COLORS.line}`,
                          background: currentInput === opt ? `${themeColor}12` : COLORS.bg,
                          color: currentInput === opt ? themeColor : COLORS.secondary,
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 15,
                          fontWeight: currentInput === opt ? 500 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                ) : currentStep.type === 'textarea' ? (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={currentInput}
                    onChange={(e) => { setCurrentInput(e.target.value); setError(null); }}
                    placeholder={currentStep.placeholder}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      borderRadius: 16,
                      background: COLORS.bg,
                      border: `1.5px solid ${error ? '#e57373' : COLORS.line}`,
                      color: COLORS.text,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 16,
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: 120,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type={currentStep.type}
                    value={currentInput}
                    onChange={(e) => { setCurrentInput(e.target.value); setError(null); }}
                    onKeyDown={handleKeyDown}
                    placeholder={currentStep.placeholder}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      borderRadius: 16,
                      background: COLORS.bg,
                      border: `1.5px solid ${error ? '#e57373' : COLORS.line}`,
                      color: COLORS.text,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 16,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}

                {error && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#e57373', marginTop: -4 }}>⚠ {error}</div>}
                {submitError && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#e57373' }}>⚠ {submitError}</div>}

                {currentStep.type !== 'intro' && currentStep.type !== 'select' && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {step > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(s => s - 1)}
                        style={{
                          padding: '18px 20px',
                          borderRadius: 16,
                          border: `1.5px solid ${COLORS.line}`,
                          background: 'transparent',
                          color: COLORS.secondary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ArrowLeft size={18} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        padding: '18px 24px',
                        borderRadius: 16,
                        border: 'none',
                        background: themeColor,
                        color: '#15130F',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: isSubmitting ? 0.7 : 1,
                        boxShadow: `0 4px 20px ${themeColor}20`
                      }}
                    >
                      {isSubmitting ? 'Submitting…' : step === STEPS.length - 1 ? 'Submit' : 'Continue'} ────────&rarr;
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right: Context Pane ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Dynamic Features Box */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 24, padding: 32 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: themeColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            {answers.businessType ? `Typical ${answers.businessType} Projects` : 'Typical Projects'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentContext.map((feature, i) => (
              <motion.div
                key={feature + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: COLORS.text }}
              >
                <span style={{ color: themeColor, marginRight: 8, fontWeight: 600 }}>✓</span> 
                {feature.replace('✓ ', '')}
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${COLORS.line}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: themeColor }}>✓</span> Response within 24 hours
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: themeColor }}>✓</span> Free consultation
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: themeColor }}>✓</span> No obligation
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 24, padding: 32 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500, color: COLORS.text, marginBottom: 20 }}>
            Need to talk sooner?
          </div>
          <a
            href="https://calendar.app.google/ycwYzWhqVRR6ZB3R9"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '20px 24px',
              borderRadius: 16,
              background: COLORS.bg,
              border: `1.5px solid ${themeColor}`,
              textDecoration: 'none',
              marginBottom: 16,
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Calendar size={18} color={themeColor} strokeWidth={1.5} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: themeColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Google Meet
              </div>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 500, color: COLORS.text, marginBottom: 4 }}>
              Schedule a strategy call
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.secondary }}>
              20–30 minutes
            </div>
          </a>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <a
              href="https://wa.me/919313846266"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px',
                borderRadius: 12,
                border: `1px solid ${COLORS.line}`,
                background: COLORS.bg,
                color: COLORS.text,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <MessageCircle size={16} strokeWidth={1.5} color={COLORS.secondary} /> WhatsApp
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=duokarma54@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px',
                borderRadius: 12,
                border: `1px solid ${COLORS.line}`,
                background: COLORS.bg,
                color: COLORS.text,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <Mail size={16} strokeWidth={1.5} color={COLORS.secondary} /> Email
            </a>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
