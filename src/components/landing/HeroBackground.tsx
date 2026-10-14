import React from 'react';


/* ─── Grid configuration ─── */
const VERTICAL_POSITIONS = ['12.6%', '37.5%', '61.9%', '86.2%'];
const HORIZONTAL_POSITIONS = ['32.7%', '71.4%'];

/* ─── Node configuration — precisely aligned with 3 flower blooms ─── */
const NODES = [
  {
    id: 'core',
    // Flower 1: Top blossom
    squarePos: { top: '17%', left: '53%' },
    squareDelay: 1500,
    labelPos: { top: '11%', left: '68%' },
    labelAnim: 'lumen-slide-right',
    labelDelay: 1100,
    title: '[ CORE_ENTITY ]',
    desc: 'Neural node processing real-time data streams.',
    descMaxW: 160,
  },
  {
    id: 'luminous',
    // Flower 3: Bottom-right blossom
    squarePos: { top: '58%', left: '56%' },
    squareDelay: 1800,
    labelPos: { top: '50%', left: '69%' },
    labelAnim: 'lumen-slide-right',
    labelDelay: 1400,
    title: '[ LUMINOUS_INSIGHT ]',
    desc: 'Deep-learning engine synthesizing raw inputs.',
    descMaxW: 160,
  },
  {
    id: 'connect',
    // Flower 2: Middle-left central blossom
    squarePos: { top: '46%', left: '41%' },
    squareDelay: 2100,
    labelPos: { top: '63%', left: '20%' },
    labelAnim: 'lumen-slide-left',
    labelDelay: 1700,
    title: '[ CONNECTIVITY ]',
    desc: 'Latency-free transmission across distributed networks.',
    descMaxW: 175,
  },
] as const;

/* ─── Connector line configuration ─── */
const CONNECTOR_LINES = [
  // Core entity connector (Top Flower) — connects label to top-right corner of core box
  { x1: '68%', y1: '13%', x2: '63%', y2: '13%', delay: 1200 },
  { x1: '63%', y1: '13%', x2: '58%', y2: '17%', delay: 1400 },
  // Luminous insight connector (Bottom-Right Flower) — connects label to top-right corner of luminous box
  { x1: '69%', y1: '52%', x2: '65.5%', y2: '52%', delay: 1500 },
  { x1: '65.5%', y1: '52%', x2: '61.5%', y2: '58%', delay: 1700 },
  // Connectivity connector (Middle-Left Flower) — connects label to bottom-left corner of connect box
  { x1: '36%', y1: '65%', x2: '39%', y2: '65%', delay: 1800 },
  { x1: '39%', y1: '65%', x2: '41%', y2: '53%', delay: 2000 },
] as const;

/* ─── Grid Lines sub-component ─── */
function GridLines() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Vertical lines — wipe down */}
      {VERTICAL_POSITIONS.map((left, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 h-full w-px bg-white/[0.04] lumen-grid-v"
          style={{ left, animationDelay: `${600 + i * 100}ms` }}
        />
      ))}

      {/* Horizontal lines — wipe right */}
      {HORIZONTAL_POSITIONS.map((top, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 w-full h-px bg-white/[0.04] lumen-grid-h"
          style={{ top, animationDelay: `${800 + i * 150}ms` }}
        />
      ))}

      {/* Plus marks at every intersection — 8 total */}
      {HORIZONTAL_POSITIONS.map((top, hi) =>
        VERTICAL_POSITIONS.map((left, vi) => (
          <div
            key={`plus-${hi}-${vi}`}
            className="absolute lumen-scale-in"
            style={{
              top,
              left,
              animationDelay: `${1000 + (hi * 4 + vi) * 80}ms`,
            }}
          >
            {/* Horizontal bar — centered on intersection */}
            <div className="absolute w-[10px] h-px bg-white/70 -translate-x-1/2 -translate-y-1/2" />
            {/* Vertical bar — centered on intersection */}
            <div className="absolute w-px h-[10px] bg-white/70 -translate-x-1/2 -translate-y-1/2" />
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Connector Line sub-component ─── */
function ConnectorLine({
  x1, y1, x2, y2, delay,
}: {
  x1: string; y1: string; x2: string; y2: string; delay: number;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none lumen-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ─── Central Nodes sub-component (desktop only ≥768px) ─── */
function CentralNodes() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
      {/* Squares — top-left coordinate is the connection anchor for elbow lines */}
      {NODES.map((node) => (
        <div
          key={`sq-${node.id}`}
          className="absolute w-[70px] h-[70px] lg:w-[84px] lg:h-[84px] border border-white/35 lumen-scale-in backdrop-blur-[1px]"
          style={{
            top: node.squarePos.top,
            left: node.squarePos.left,
            animationDelay: `${node.squareDelay}ms`,
          }}
        />
      ))}

      {/* Labels — arrive before their squares per spec §14 */}
      {NODES.map((node) => (
        <div
          key={`lbl-${node.id}`}
          className={`absolute ${node.labelAnim}`}
          style={{
            top: node.labelPos.top,
            left: node.labelPos.left,
            animationDelay: `${node.labelDelay}ms`,
          }}
        >
          <span
            className="text-white/70 text-[12px] leading-[15px] whitespace-nowrap font-mono tracking-wider"
          >
            {node.title}
          </span>
          <p
            className="text-white/40 text-[11px] leading-[14px] mt-[3px]"
            style={{ maxWidth: node.descMaxW }}
          >
            {node.desc}
          </p>
        </div>
      ))}

      {/* Connector lines — elbow pairs, horizontal then diagonal into square TL corner */}
      {CONNECTOR_LINES.map((line, i) => (
        <ConnectorLine key={`cl-${i}`} {...line} />
      ))}
    </div>
  );
}

/* ─── Main HeroBackground component ─── */
export const HeroBackground = React.memo(function HeroBackground() {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-black" aria-hidden="true">
      {/* Layer 0: Full-bleed jellyfish video playing on all devices (mobile + desktop) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_115057_94c3699b-0fd1-4124-bcf3-3626bb8c1f77.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover lumen-fade-in pointer-events-none opacity-90"
      />

      {/* Layer 1: Grid lines + plus marks (above video, below content) */}
      <div className="absolute inset-0 z-[20]">
        <GridLines />
        <CentralNodes />
      </div>
    </div>
  );
});
