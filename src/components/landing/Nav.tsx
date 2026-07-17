import { useState } from 'react';
import { m as motion, useScroll, useMotionValueEvent } from 'framer-motion';

const LINKS = ['Work', 'Services', 'Process', 'Contact'];

export function Nav() {
  const [active, setActive] = useState('Work');
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 120);
    setScrolled(latest > 40);
  });

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setActive(id);
  };

  return (
    <motion.nav
      variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: -80, opacity: 0 } }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 pt-4 pb-0 pointer-events-none"
    >
      {/* Logo — always visible, pointer-events restored */}
      <a href="/" aria-label="DuoKarma Home" className="pointer-events-auto flex items-center gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A876] rounded-md">
        <img
          src="/logo.jpeg"
          alt=""
          className="w-10 h-10 object-contain drop-shadow rounded"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-white text-[1.5rem] italic font-medium tracking-tight leading-none"
        >
          DuoKarma
        </span>
      </a>

      {/* Center floating pill — desktop only */}
      <motion.div
        animate={{
          paddingTop: scrolled ? '6px' : '8px',
          paddingBottom: scrolled ? '6px' : '8px',
          backgroundColor: scrolled ? 'rgba(10,9,8,0.72)' : 'rgba(21,19,15,0.5)',
          borderColor: scrolled ? 'rgba(201,168,118,0.25)' : 'rgba(201,168,118,0.12)',
          backdropFilter: scrolled ? 'blur(28px)' : 'blur(16px)',
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 px-2 rounded-full border"
        style={{ WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'blur(16px)' }}
      >
        {LINKS.map((link) => (
          <NavItem
            key={link}
            label={link}
            active={active === link}
            onClick={() => scrollTo(link)}
          />
        ))}
      </motion.div>

      {/* Book a call — desktop only */}
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="pointer-events-auto hidden md:block bg-white text-[#0A0908] text-sm font-semibold px-5 py-2 rounded-full shadow-sm hover:bg-[#F3EEE3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A876]"
        style={{ fontFamily: "'Inter', sans-serif" }}
        onClick={() => scrollTo('Contact')}
        aria-label="Book a call"
        data-cursor="Book a call"
      >
        Book a call
      </motion.button>
    </motion.nav>
  );
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A876]"
      style={{
        fontFamily: "'Inter', sans-serif",
        color: active ? '#F3EEE3' : 'rgba(243,238,227,0.55)',
      }}
      data-cursor={label}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(201,168,118,0.14)', border: '1px solid rgba(201,168,118,0.22)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
