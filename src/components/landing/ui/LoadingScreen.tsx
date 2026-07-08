import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from './theme';

export function LoadingScreen({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "fixed",
            inset: 0,
            background: COLORS.bg,
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.05em" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: COLORS.text }}
          >
            DuoKarma
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ height: 1, background: COLORS.accent, marginTop: 18 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}