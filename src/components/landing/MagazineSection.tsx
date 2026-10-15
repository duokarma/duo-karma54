import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Eyebrow } from './ui/Eyebrow';
import { Reveal } from './ui/Reveal';
import { COLORS } from './ui/theme';
import { Magazine3D } from './magazine/Magazine3D';
import { MagazineSpreadReader } from './magazine/MagazineSpreadReader';
import { BookOpen, Compass } from 'lucide-react';

export function MagazineSection() {
  const [viewMode, setViewMode] = useState<'3d' | 'reader'>('3d');
  const [currentSpread, setCurrentSpread] = useState(0);

  const handleOpenReader = () => {
    setViewMode('reader');
  };

  const handleCloseReader = () => {
    setViewMode('3d');
  };

  return (
    <section
      id="folio"
      style={{
        background: COLORS.bg,
        padding: '140px 5%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="max-w-[1240px] mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-16">
          <Reveal>
            <div>
              <Eyebrow>Interactive 3D Portfolio</Eyebrow>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  fontSize: 'clamp(32px, 4vw, 54px)',
                  color: COLORS.text,
                  lineHeight: 1.15,
                  marginTop: 14,
                  maxWidth: 680,
                }}
              >
                The DuoKarma Folio.
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: COLORS.secondary,
                  lineHeight: 1.65,
                  marginTop: 14,
                  maxWidth: 580,
                }}
              >
                Two Founders. One Standard. Exceptional Software. Rotate our monograph 360° in realistic 3D space, or open the folio to inspect our real client systems, architecture, and global reach.
              </p>
            </div>
          </Reveal>

          {/* Toggle View Pill */}
          <Reveal delay={0.1}>
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#11110F] border border-[#292720] self-start md:self-auto">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-[#C5A46D] text-[#0A0A09] font-semibold shadow-sm'
                    : 'text-[#A6A197] hover:text-[#F2EEE6]'
                }`}
              >
                <Compass size={14} />
                <span>3D Inspect</span>
              </button>

              <button
                onClick={() => setViewMode('reader')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === 'reader'
                    ? 'bg-[#C5A46D] text-[#0A0A09] font-semibold shadow-sm'
                    : 'text-[#A6A197] hover:text-[#F2EEE6]'
                }`}
              >
                <BookOpen size={14} />
                <span>Read Spreads</span>
              </button>
            </div>
          </Reveal>
        </div>

        {/* Dynamic Interactive Experience */}
        <div className="w-full relative min-h-[550px] sm:min-h-[640px] md:min-h-[720px] rounded-2xl bg-[#0E0E0C] border border-[#292720] overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            {viewMode === '3d' ? (
              <motion.div
                key="3d-mode"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex items-center justify-center"
              >
                <Magazine3D onOpen={handleOpenReader} />
              </motion.div>
            ) : (
              <motion.div
                key="reader-mode"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                <MagazineSpreadReader
                  currentSpread={currentSpread}
                  onSpreadChange={setCurrentSpread}
                  onClose={handleCloseReader}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
