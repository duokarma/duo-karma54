import { useEffect, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';
import { MAGAZINE_SPREADS, type MagazinePage } from './magazine-data';

interface MagazineSpreadReaderProps {
  currentSpread: number;
  onSpreadChange: (index: number) => void;
  onClose: () => void;
}

function PageContent({ page }: { page: MagazinePage }) {
  const isDark = page.theme === 'dark';
  const bgColor = isDark ? '#11110F' : '#F7F4EE';
  const textColor = isDark ? '#F2EEE6' : '#11110F';
  const secondaryColor = isDark ? '#A6A197' : '#5A564F';
  const borderColor = isDark ? '#292720' : '#E2DDD4';

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full p-8 sm:p-10 md:p-12 transition-colors select-text"
      style={{
        background: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
      }}
    >
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between pb-4 mb-8 border-b" style={{ borderColor }}>
          <span
            className="text-[11px] font-mono tracking-[0.18em] uppercase"
            style={{ color: '#C5A46D' }}
          >
            {page.category}
          </span>
          <span
            className="text-[12px] font-mono tracking-widest font-semibold"
            style={{ color: secondaryColor }}
          >
            {page.pageNumber}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3
          className="text-2xl sm:text-3xl md:text-[32px] font-normal tracking-tight leading-[1.2] mb-3"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {page.title}
        </h3>

        {page.subtitle && (
          <p
            className="text-sm sm:text-base font-normal mb-6 italic"
            style={{ fontFamily: "'Fraunces', serif", color: '#C5A46D' }}
          >
            {page.subtitle}
          </p>
        )}

        {/* Body Paragraph */}
        <p
          className="text-[14px] sm:text-[14.5px] leading-relaxed font-sans mb-8"
          style={{ color: secondaryColor }}
        >
          {page.content}
        </p>

        {/* Highlights list */}
        {page.highlights && page.highlights.length > 0 && (
          <div className="space-y-3 pt-4 border-t" style={{ borderColor }}>
            <div
              className="text-[10.5px] font-mono uppercase tracking-[0.16em] mb-3"
              style={{ color: '#C5A46D' }}
            >
              Key Highlights
            </div>
            <ul className="space-y-2.5">
              {page.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 text-[13px] sm:text-[13.5px] leading-snug font-sans"
                  style={{ color: textColor }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: '#C5A46D' }}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Metadata */}
      {page.metadata && (
        <div
          className="pt-6 mt-8 border-t flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-wider"
          style={{ borderColor, color: secondaryColor }}
        >
          {page.metadata.map((m) => (
            <div key={m.label} className="flex flex-col">
              <span className="text-[9.5px] text-[#C5A46D]">{m.label}</span>
              <span className="font-medium text-[11.5px] mt-0.5" style={{ color: textColor }}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MagazineSpreadReader({
  currentSpread,
  onSpreadChange,
  onClose,
}: MagazineSpreadReaderProps) {
  const totalSpreads = MAGAZINE_SPREADS.length;
  const spread = MAGAZINE_SPREADS[currentSpread] || MAGAZINE_SPREADS[0];

  const handleNext = useCallback(() => {
    if (currentSpread < totalSpreads - 1) {
      onSpreadChange(currentSpread + 1);
    }
  }, [currentSpread, totalSpreads, onSpreadChange]);

  const handlePrev = useCallback(() => {
    if (currentSpread > 0) {
      onSpreadChange(currentSpread - 1);
    }
  }, [currentSpread, onSpreadChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev, onClose]);

  return (
    <div className="relative w-full max-w-[1240px] mx-auto flex flex-col items-center">
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-[#292720] px-2 sm:px-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest uppercase text-[#C5A46D]">
            FOLIO SPREAD {String(currentSpread + 1).padStart(2, '0')} / {String(totalSpreads).padStart(2, '0')}
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-[#77736B]">
            • Pages {spread.leftPage.pageNumber} — {spread.rightPage.pageNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSpreadChange(0)}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#A6A197] hover:text-[#F2EEE6] px-3 py-1.5 rounded-full border border-[#292720] bg-[#11110F] transition-colors cursor-pointer"
            title="Return to Cover"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Cover</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#0A0A09] bg-[#C5A46D] hover:bg-[#D7BC8C] font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-sm"
          >
            <X size={13} />
            <span>Close Folio</span>
          </button>
        </div>
      </div>

      {/* Open Book Spread Container */}
      <div className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-[#0A0A09] border border-[#292720]/80">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpread}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 min-h-[580px] sm:min-h-[640px] md:min-h-[720px] relative"
          >
            {/* Spine Gutter Shadow line down the center (desktop) */}
            <div
              className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.08) 65%, rgba(0,0,0,0.4) 100%)',
              }}
            />

            {/* Left Page */}
            <div className="flex w-full h-full p-2 sm:p-4">
              <PageContent page={spread.leftPage} />
            </div>

            {/* Right Page */}
            <div className="flex w-full h-full p-2 sm:p-4 border-t md:border-t-0 md:border-l border-[#292720]">
              <PageContent page={spread.rightPage} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows Overlay */}
        <button
          onClick={handlePrev}
          disabled={currentSpread === 0}
          aria-label="Previous Spread"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#11110F]/90 border border-[#292720] text-[#F2EEE6] flex items-center justify-center hover:border-[#C5A46D] hover:text-[#C5A46D] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNext}
          disabled={currentSpread === totalSpreads - 1}
          aria-label="Next Spread"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#11110F]/90 border border-[#292720] text-[#F2EEE6] flex items-center justify-center hover:border-[#C5A46D] hover:text-[#C5A46D] disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Bottom Paging Dots */}
      <div className="flex items-center gap-3 mt-6">
        {MAGAZINE_SPREADS.map((_, i) => (
          <button
            key={i}
            onClick={() => onSpreadChange(i)}
            aria-label={`Go to spread ${i + 1}`}
            className="group py-2 px-1 focus:outline-none cursor-pointer"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                currentSpread === i
                  ? 'w-8 h-2 bg-[#C5A46D]'
                  : 'w-2 h-2 bg-[#292720] group-hover:bg-[#A6A197]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
