import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './theme';

export function MagneticButton({ children, primary = false, onClick }: { children: React.ReactNode, primary?: boolean, onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    setPos({ x, y });
  };
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        padding: "14px 30px",
        borderRadius: 999,
        border: primary ? "none" : `1px solid ${COLORS.line}`,
        background: primary ? COLORS.accent : "transparent",
        color: primary ? "#15130F" : COLORS.text,
        cursor: "pointer",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </motion.button>
  );
}