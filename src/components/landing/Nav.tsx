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
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 pt-4 pb-0 pointer-events-none"
    >
      {/* Logo — always visible, pointer-events restored */}
      <a href="/" aria-label="DuoKarma Home" className="pointer-events-auto flex items-center gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] rounded-md">
        <img
          src="/logo.jpeg"
          alt=""
          className="w-10 h-10 object-contain rounded"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-[#F2EEE6] text-[1.5rem] italic font-medium tracking-tight leading-none"
        >
          DuoKarma
        </span>
      </a>

      {/* Center floating pill — desktop only */}
      <motion.div
        animate={{
          paddingTop: scrolled ? '6px' : '8px',
          paddingBottom: scrolled ? '6px' : '8px',
          backgroundColor: scrolled ? 'rgba(17,17,15,0.88)' : 'rgba(21,21,18,0.75)',
          borderColor: '#292720',
          backdropFilter: 'blur(20px)',
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 px-2 rounded-full border shadow-sm"
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="pointer-events-auto hidden md:block bg-[#C5A46D] hover:bg-[#D7BC8C] text-[#0A0A09] text-sm font-semibold px-5 py-2 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] cursor-pointer"
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
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] cursor-pointer"
      style={{
        fontFamily: "'Inter', sans-serif",
        color: active ? '#F2EEE6' : '#A6A197',
      }}
      data-cursor={label}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(197,164,109,0.12)', border: '1px solid rgba(197,164,109,0.25)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
