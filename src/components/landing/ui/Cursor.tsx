import { useState, useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { COLORS } from './theme';

const CURSOR_LABELS: Record<string, string> = {
  button: 'Click',
  a: 'Open',
};

export function Cursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const x = useSpring(-200, { stiffness: 600, damping: 38, mass: 0.4 });
  const y = useSpring(-200, { stiffness: 600, damping: 38, mass: 0.4 });

  useEffect(() => {
    // Detect touch devices — hide cursor entirely
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const closest = target.closest('[data-cursor], button, a') as HTMLElement | null;
      if (closest) {
        const customLabel = closest.getAttribute('data-cursor');
        setLabel(customLabel || CURSOR_LABELS[closest.tagName.toLowerCase()] || 'View');
        setHovering(true);
      } else {
        setLabel(null);
        setHovering(false);
      }
    };

    const onLeave = () => { x.set(-200); y.set(-200); };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="dk-cursor fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hovering ? (label ? 72 : 36) : 24,
          height: hovering ? 36 : 24,
          borderRadius: hovering ? 999 : 999,
          borderColor: hovering ? COLORS.accent : 'rgba(201,168,118,0.6)',
          borderWidth: hovering ? 1.5 : 1,
          backgroundColor: hovering ? 'rgba(201,168,118,0.08)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          border: `1px solid rgba(201,168,118,0.6)`,
          mixBlendMode: 'normal',
        } as any}
      >
        {label && hovering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: COLORS.accent,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="dk-cursor fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: COLORS.accent,
        }}
        animate={{ opacity: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}