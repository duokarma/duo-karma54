import React from 'react';
import { motion } from 'framer-motion';

export function Reveal({ children, delay = 0, y = 24, className = '', style = {} }: { children: React.ReactNode, delay?: number, y?: number, className?: string, style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}