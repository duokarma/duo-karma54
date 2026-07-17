import { useState, useEffect, useRef, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './ui/theme';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  category: string;
  action: () => void;
  icon: React.ReactNode;
}

function makeItems(onClose: () => void): CommandItem[] {
  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
  };

  return [
    {
      id: 'home',
      label: 'Go to top',
      description: 'Scroll to the top of the page',
      category: 'Navigate',
      action: () => { onClose(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>,
    },
    {
      id: 'work',
      label: 'View our work',
      description: 'See all projects and case studies',
      category: 'Navigate',
      action: () => scrollTo('work'),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    },
    {
      id: 'services',
      label: 'Explore services',
      description: 'What we build for businesses',
      category: 'Navigate',
      action: () => scrollTo('services'),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></svg>,
    },
    {
      id: 'process',
      label: 'Our process',
      description: 'How we build every project',
      category: 'Navigate',
      action: () => scrollTo('process'),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    },
    {
      id: 'contact',
      label: 'Book a consultation',
      description: 'Get in touch with the team',
      category: 'Actions',
      action: () => scrollTo('contact'),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
    },
    {
      id: 'salon-admin',
      label: 'Salon Admin Platform',
      description: 'Booking, billing, and staff management',
      category: 'Projects',
      action: () => scrollTo('work'),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
    },
    {
      id: 'farmhouse',
      label: 'Farmhouse Booking',
      description: 'Online booking with live availability',
      category: 'Projects',
      action: () => scrollTo('work'),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    },
  ];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = makeItems(onClose);

  const filtered = query.trim()
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const categories = [...new Set(filtered.map((i) => i.category))];

  useEffect(() => {
    setSelectedIndex(0);
    setQuery('');
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [open, filtered, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 300,
            }}
          />

          {/* Palette modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            style={{
              position: 'fixed',
              top: '20vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(600px, 90vw)',
              zIndex: 301,
              background: COLORS.surface,
              border: `1px solid rgba(201,168,118,0.2)`,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Search projects, services, pages…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: COLORS.text,
                }}
              />
              <kbd
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  padding: '3px 6px',
                  borderRadius: 5,
                  background: 'rgba(243,238,227,0.06)',
                  border: `1px solid ${COLORS.line}`,
                  color: COLORS.secondary,
                  letterSpacing: '0.05em',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '8px 8px 12px' }}>
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '32px 20px',
                    textAlign: 'center',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    color: COLORS.secondary,
                  }}
                >
                  No results for "{query}"
                </div>
              ) : (
                categories.map((cat) => {
                  const catItems = filtered.filter((i) => i.category === cat);
                  return (
                    <div key={cat}>
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: COLORS.secondary,
                          padding: '10px 14px 6px',
                        }}
                      >
                        {cat}
                      </div>
                      {catItems.map((item) => {
                        const isSelected = flatIndex === selectedIndex;
                        const currentIndex = flatIndex++;
                        return (
                          <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: 'rgba(201,168,118,0.07)' }}
                            onClick={item.action}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 14px',
                              borderRadius: 10,
                              border: 'none',
                              background: isSelected ? 'rgba(201,168,118,0.1)' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              outline: isSelected ? `1px solid rgba(201,168,118,0.2)` : 'none',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <span style={{ color: isSelected ? COLORS.accent : COLORS.secondary, flexShrink: 0 }}>
                              {item.icon}
                            </span>
                            <span style={{ flex: 1 }}>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: COLORS.text, display: 'block' }}>
                                {item.label}
                              </span>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.secondary }}>
                                {item.description}
                              </span>
                            </span>
                            {isSelected && (
                              <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'rgba(243,238,227,0.06)', border: `1px solid ${COLORS.line}`, color: COLORS.secondary }}>
                                ↵
                              </kbd>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '10px 20px',
                borderTop: `1px solid ${COLORS.line}`,
                display: 'flex',
                gap: 16,
              }}
            >
              {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([key, label]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'rgba(243,238,227,0.06)', border: `1px solid ${COLORS.line}`, color: COLORS.secondary }}>
                    {key}
                  </kbd>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: COLORS.secondary }}>{label}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
