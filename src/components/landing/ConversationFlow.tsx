import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Calendar, MessageCircle } from 'lucide-react';
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

type StepKey = keyof Answers;

interface Step {
  key: StepKey;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  question: string;
  placeholder?: string;
  options?: string[];
  validate?: (val: string) => string | null;
}

const STEPS: Step[] = [
  {
    key: 'name',
    type: 'text',
    question: "What's your name?",
    placeholder: 'e.g. Raj Patel',
    validate: (v) => (v.trim().length < 2 ? 'Please enter your name' : null),
  },
  {
    key: 'email',
    type: 'email',
    question: "What's your email address?",
    placeholder: 'you@example.com',
    validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Please enter a valid email'),
  },
  {
    key: 'businessType',
    type: 'select',
    question: 'What type of business do you have?',
    options: ['Salon', 'Farmhouse', 'Clinic', 'Gym', 'Restaurant', 'Other'],
  },
  {
    key: 'branches',
    type: 'select',
    question: 'How many branches do you have?',
    options: ['1 Branch', '2–5 Branches', '5+ Branches'],
  },
  {
    key: 'interestedIn',
    type: 'select',
    question: "What are you looking for?",
    options: ['Website', 'Admin Software', 'Booking System', 'CRM', 'Automation', 'Not Sure'],
  },
  {
    key: 'challenge',
    type: 'textarea',
    question: "What's the biggest challenge you're facing right now?",
    placeholder: 'e.g. Managing appointments, tracking revenue…',
    validate: (v) => (v.trim().length < 5 ? 'Please describe your challenge briefly' : null),
  },
  {
    key: 'timeline',
    type: 'select',
    question: 'When are you planning to start?',
    options: ['Immediately', 'This Month', 'Just Exploring'],
  },
  {
    key: 'phone',
    type: 'tel',
    question: "What's the best number to contact you?",
    placeholder: '9876543210',
    validate: (v) => (/^\+?[\d\s\-()]{7,15}$/.test(v.trim()) ? null : 'Please enter a valid phone number'),
  },
];

const STORAGE_KEY = 'dk_convo_draft';
const TOTAL = STEPS.length;

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  wrapper: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 20,
    padding: '32px 28px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  assistantRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 16,
  },
  bubble: {
    background: COLORS.surface2,
    border: `1px solid ${COLORS.line}`,
    borderRadius: '4px 16px 16px 16px',
    padding: '14px 18px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 1.55,
    maxWidth: 'calc(100% - 48px)',
  },
  question: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 1.45,
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 12,
    background: COLORS.bg,
    border: `1.5px solid ${COLORS.line}`,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 12,
    background: COLORS.bg,
    border: `1.5px solid ${COLORS.line}`,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 100,
    boxSizing: 'border-box' as const,
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 10,
  },
  option: (selected: boolean) => ({
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${selected ? COLORS.accent : COLORS.line}`,
    background: selected ? `${COLORS.accent}18` : COLORS.bg,
    color: selected ? COLORS.accent : COLORS.secondary,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: selected ? 500 : 400,
    cursor: 'pointer',
    transition: 'all 0.18s',
    textAlign: 'center' as const,
  }),
  progressBar: {
    height: 3,
    background: COLORS.line,
    borderRadius: 99,
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: (pct: number) => ({
    height: '100%',
    width: `${pct}%`,
    background: COLORS.accent,
    borderRadius: 99,
    transition: 'width 0.4s ease',
  }),
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  btnBack: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    borderRadius: 10,
    border: `1px solid ${COLORS.line}`,
    background: 'transparent',
    color: COLORS.secondary,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    cursor: 'pointer',
  },
  btnNext: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 22px',
    borderRadius: 10,
    border: 'none',
    background: COLORS.accent,
    color: '#15130F',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorMsg: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: '#e57373',
    marginTop: 8,
  },
  stepLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: COLORS.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 6,
  },
};

// ─── Typing Animation ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.accent, display: 'block' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ─── Final / Success Screen ───────────────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ textAlign: 'center', padding: '20px 0' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `${COLORS.accent}20`,
          border: `2px solid ${COLORS.accent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Check size={28} color={COLORS.accent} />
      </motion.div>

      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 22, color: COLORS.text, marginBottom: 8 }}>
        Perfect, {name}!
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: COLORS.secondary, marginBottom: 28, lineHeight: 1.6 }}>
        We've got everything we need.<br />
        Our team will review your requirements and contact you <strong style={{ color: COLORS.text }}>within 24 hours</strong>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <a
          href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '13px 20px',
            borderRadius: 12,
            border: `1px solid ${COLORS.accent}`,
            background: 'transparent',
            color: COLORS.accent,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <Calendar size={16} /> Book a Google Meet call
        </a>
        <a
          href="https://wa.me/918758457909"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '13px 20px',
            borderRadius: 12,
            border: `1px solid ${COLORS.line}`,
            background: COLORS.bg,
            color: COLORS.text,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <MessageCircle size={16} /> Chat on WhatsApp
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

  const currentStep = STEPS[step];

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step: s, answers: a } = JSON.parse(saved);
        if (typeof s === 'number' && a) {
          setStep(s);
          setAnswers(a);
          setCurrentInput((a as Answers)[STEPS[s]?.key] ?? '');
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

  // Typing animation before showing input
  useEffect(() => {
    setIsTyping(true);
    setError(null);
    const t = setTimeout(() => {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }, 900);
    return () => clearTimeout(t);
  }, [step]);

  // Pre-fill current input when navigating back
  useEffect(() => {
    if (currentStep) {
      setCurrentInput((answers[currentStep.key] as string) ?? '');
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    const stepDef = STEPS[step];
    const val = currentInput.trim();
    if (stepDef.validate) {
      const err = stepDef.validate(val);
      if (err) { setError(err); return; }
    } else if (stepDef.type === 'select' && !val) {
      setError('Please select an option');
      return;
    }
    const updated = { ...answers, [stepDef.key]: val };
    setAnswers(updated);
    setCurrentInput('');
    setError(null);

    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit(updated as Answers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleSelect = (option: string) => {
    setCurrentInput(option);
    setError(null);
    // Auto-advance on select after brief delay
    const updated = { ...answers, [currentStep.key]: option };
    setAnswers(updated);
    setError(null);
    setTimeout(() => {
      if (step < TOTAL - 1) {
        setStep((s) => s + 1);
        setCurrentInput('');
      } else {
        handleSubmit(updated as Answers);
      }
    }, 220);
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
      // Duplicate guard — same email in last 24h
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
        source: 'website_chat',
        status: 'new',
        lead_score: leadScore,
      });

      if (insertError) throw insertError;
      setIsDone(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again or email us at hello@duokarma.com");
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div style={s.wrapper}>
        <SuccessScreen name={answers.name ?? 'there'} />
      </div>
    );
  }

  const progress = ((step) / TOTAL) * 100;
  const isSelect = currentStep.type === 'select';

  return (
    <div style={s.wrapper}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={s.stepLabel}>Step {step + 1} of {TOTAL}</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.secondary }}>
          {Math.round(progress)}%
        </div>
      </div>
      <div style={s.progressBar}>
        <div style={s.progressFill(progress + (100 / TOTAL))} />
      </div>

      {/* Assistant bubble */}
      <div style={s.assistantRow}>
        <div style={s.avatar}>🤝</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step + '-bubble'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={s.bubble}
          >
            {isTyping ? <TypingDots /> : currentStep.question}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        {!isTyping && (
          <motion.div
            key={step + '-input'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {isSelect ? (
              <div style={s.optionGrid}>
                {currentStep.options!.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(opt)}
                    style={s.option(currentInput === opt)}
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
                  ...s.textarea,
                  borderColor: error ? '#e57373' : COLORS.line,
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
                  ...s.input,
                  borderColor: error ? '#e57373' : COLORS.line,
                }}
              />
            )}

            {error && <div style={s.errorMsg}>⚠ {error}</div>}
            {submitError && <div style={{ ...s.errorMsg, marginTop: 12 }}>⚠ {submitError}</div>}

            {/* Navigation */}
            {!isSelect && (
              <div style={s.navRow}>
                {step > 0 ? (
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleBack} style={s.btnBack}>
                    <ArrowLeft size={14} /> Back
                  </motion.button>
                ) : <div />}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  disabled={isSubmitting}
                  style={{ ...s.btnNext, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Submitting…' : step === TOTAL - 1 ? (
                    <><Check size={14} /> Submit</>
                  ) : (
                    <>Next <ArrowRight size={14} /></>
                  )}
                </motion.button>
              </div>
            )}

            {/* Back button for select steps */}
            {isSelect && step > 0 && (
              <div style={{ marginTop: 16 }}>
                <button onClick={handleBack} style={{ ...s.btnBack, border: 'none', background: 'none', padding: '6px 0' }}>
                  <ArrowLeft size={13} /> Back
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome tag */}
      {step === 0 && !isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: COLORS.accent,
            background: `${COLORS.accent}15`,
            border: `1px solid ${COLORS.accent}30`,
            borderRadius: 99,
            padding: '3px 10px',
            letterSpacing: '0.06em',
          }}
        >
          2 min
        </motion.div>
      )}
    </div>
  );
}
