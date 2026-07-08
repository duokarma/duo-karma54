import { motion } from 'framer-motion';
import { COLORS } from './ui/theme';
import { MagneticButton } from './ui/MagneticButton';

export function Nav() {
    const links = ["Work", "Services", "Process", "Contact"];
  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 5%",
          background: "linear-gradient(to bottom, rgba(10,9,8,0.85), transparent)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 20,
            letterSpacing: "0.02em",
            color: COLORS.text,
          }}
        >
          DuoKarma
        </div>
        <div style={{ display: "flex", gap: 36 }} className="dk-nav-links">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: COLORS.secondary,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              {l}
            </a>
          ))}
        </div>
        <div className="dk-nav-cta">
          <MagneticButton primary onClick={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}>Book a call</MagneticButton>
        </div>
      </motion.nav>
      <style>{`
        @media (max-width: 720px) {
          .dk-nav-links { display: none !important; }
        }
      `}</style>
    </>
  );
}