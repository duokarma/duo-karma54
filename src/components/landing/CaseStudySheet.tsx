import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { COLORS } from './ui/theme';

interface Project {
  title: string;
  category: string;
  problem: string;
  solution: string;
  result: string;
  features: string[];
  tech: string[];
  color: string;
}

interface CaseStudySheetProps {
  project: Project;
  onClose: () => void;
}

export function CaseStudySheet({ project, onClose }: CaseStudySheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y > 120 || info.velocity.y > 500) {
      onClose();
    } else {
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 40 });
    }
  };

  const stages = [
    { label: 'Challenge', icon: '⚡', text: project.problem, color: 'rgba(201,168,118,0.9)' },
    { label: 'Solution', icon: '⚙️', text: project.solution, color: 'rgba(232,207,160,0.9)' },
    { label: 'Result', icon: '✦', text: project.result, color: COLORS.emerald },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        aria-modal="true"
        role="dialog"
        aria-label={`Case study: ${project.title}`}
        className="fixed bottom-0 left-0 right-0 z-[201] touch-none"
        style={{
          y,
          background: COLORS.surface,
          borderRadius: '28px 28px 0 0',
          border: `1px solid ${COLORS.line}`,
          borderBottom: 'none',
          maxHeight: '88vh',
          overflowY: 'auto',
        } as any}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(243,238,227,0.15)' }} />
        </div>

        <div style={{ padding: '16px 32px 48px', maxWidth: 700, margin: '0 auto' }}>
          {/* Category + close */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: project.color,
              }}
            >
              {project.category}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'rgba(243,238,227,0.06)',
                border: '1px solid rgba(243,238,227,0.1)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: COLORS.secondary,
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              color: COLORS.text,
              fontWeight: 400,
              marginBottom: 36,
              lineHeight: 1.2,
            }}
          >
            {project.title}
          </h2>

          {/* Case study stages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', gap: 20, paddingBottom: i < stages.length - 1 ? 32 : 0 }}
              >
                {/* Connector line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${project.color}18`,
                      border: `1px solid ${project.color}35`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {stage.icon}
                  </div>
                  {i < stages.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: COLORS.line, marginTop: 8, minHeight: 24 }} />
                  )}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: stage.color as string,
                      marginBottom: 8,
                    }}
                  >
                    {stage.label}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14.5,
                      color: COLORS.text,
                      lineHeight: 1.7,
                    }}
                  >
                    {stage.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features */}
          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${COLORS.line}` }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: COLORS.secondary,
                marginBottom: 14,
              }}
            >
              What was built
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {project.features.map((f) => (
                <span
                  key={f}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: `1px solid ${COLORS.line}`,
                    color: COLORS.secondary,
                    background: COLORS.surface2,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => {
              onClose();
              setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
            }}
            style={{
              marginTop: 32,
              width: '100%',
              padding: '16px 0',
              borderRadius: 14,
              background: COLORS.accent,
              border: 'none',
              color: '#0A0908',
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Start a similar project →
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
