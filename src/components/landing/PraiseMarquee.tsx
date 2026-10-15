import React from 'react';

interface MarqueeItem {
  text: string;
  bold?: boolean;
}

const ROW_1: MarqueeItem[] = [
  { text: 'Building Software That Lasts', bold: true },
  { text: 'Turning Complex Ideas Into Simple Products', bold: false },
  { text: 'Thoughtful Engineering', bold: true },
  { text: 'Business-First Technology', bold: false },
  { text: 'No Templates. No Shortcuts.', bold: true },
  { text: 'Systems Built To Scale', bold: false },
];

const ROW_2: MarqueeItem[] = [
  { text: 'From First Idea To Final Deployment', bold: false },
  { text: 'Less Busywork. Better Workflows.', bold: true },
  { text: 'Built Around Your Business', bold: false },
  { text: 'Clean Code. Clear Communication.', bold: true },
  { text: 'Designed With Purpose', bold: false },
  { text: 'Software That Solves Real Problems', bold: true },
];

function MarqueeRow({
  items,
  direction = 'left',
  speed = 40,
}: {
  items: MarqueeItem[];
  direction?: 'left' | 'right';
  speed?: number;
}) {
  const animationName = direction === 'left' ? 'dkMarqueeLeft' : 'dkMarqueeRight';

  return (
    <div className="relative w-full overflow-hidden select-none py-1.5">
      <div
        className="flex items-center gap-8 md:gap-12 w-max"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {/* Render twice for seamless continuous loop */}
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className="flex items-center gap-8 md:gap-12 shrink-0">
            {items.map((item, i) => (
              <React.Fragment key={`${copyIndex}-${i}`}>
                <span
                  className={`text-[clamp(26px,4vw,52px)] tracking-tight whitespace-nowrap leading-none ${
                    item.bold ? 'font-semibold text-[#0A0A09]' : 'font-light text-[#0A0A09]/80'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.text}
                </span>
                <span
                  className="text-[clamp(14px,1.8vw,22px)] text-[#0A0A09]/25 font-light select-none px-2"
                  aria-hidden="true"
                >
                  —
                </span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PraiseMarquee() {
  return (
    <section
      aria-label="Capabilities and discipline"
      className="relative w-full overflow-hidden bg-[#F2EEE6] text-[#0A0A09] py-20 sm:py-24 md:py-32"
    >
      <style>{`
        @keyframes dkMarqueeLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes dkMarqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .w-max {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Centered Heading */}
      <div className="max-w-[1200px] mx-auto px-6 text-center mb-10 sm:mb-14 md:mb-16">
        <span
          className="inline-block text-[11px] sm:text-[12px] font-medium tracking-[0.22em] uppercase text-[#77736B]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          THINGS WE'RE GOOD AT...
        </span>
      </div>

      {/* Moving Text Rows in Opposite Directions */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        {/* Row 1: Right to Left */}
        <MarqueeRow items={ROW_1} direction="left" speed={42} />

        {/* Row 2: Left to Right */}
        <MarqueeRow items={ROW_2} direction="right" speed={46} />
      </div>
    </section>
  );
}
