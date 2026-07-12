import { useState } from 'react';
import { motion } from 'framer-motion';

const DOCK_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'work',
    label: 'Work',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'services',
    label: 'Services',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export function BottomDock() {
  const [active, setActive] = useState('home');

  const scrollTo = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setActive(id);
  };

  return (
    <div className="fixed bottom-5 left-0 right-0 flex justify-center z-[100] md:hidden pointer-events-none px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full"
        style={{
          background: 'rgba(10,9,8,0.8)',
          border: '1px solid rgba(201,168,118,0.2)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {DOCK_ITEMS.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            active={active === item.id}
            onClick={() => scrollTo(item.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}

function DockItem({ item, active, onClick }: { item: typeof DOCK_ITEMS[0]; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all"
      aria-label={item.label}
      style={{ minWidth: 56 }}
    >
      {active && (
        <motion.div
          layoutId="dock-active"
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(201,168,118,0.12)', border: '1px solid rgba(201,168,118,0.2)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span
        className="relative z-10 transition-colors"
        style={{ color: active ? '#C9A876' : 'rgba(243,238,227,0.45)' }}
      >
        {item.icon}
      </span>
      <span
        className="relative z-10 text-[10px] font-medium transition-colors"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: active ? '#C9A876' : 'rgba(243,238,227,0.4)',
          letterSpacing: '0.04em',
        }}
      >
        {item.label}
      </span>
    </motion.button>
  );
}
