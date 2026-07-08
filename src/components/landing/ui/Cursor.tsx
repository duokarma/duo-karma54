import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from './theme';

export function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <motion.div
      animate={{ x: pos.x - 6, y: pos.y - 6 }}
      transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.3 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: COLORS.accent,
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "difference",
      }}
      className="dk-cursor"
    />
  );
}