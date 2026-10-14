import React from 'react';

// Detect touch/mobile devices — module-level, no re-renders
const isTouchDevice =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

/* ─── Grid configuration ─── */
const VERTICAL_POSITIONS = ['12.6%', '37.5%', '61.9%', '86.2%'];
const HORIZONTAL_POSITIONS = ['32.7%', '71.4%'];

/* ─── Node configuration ─── */
const NODES = [
  {
    id: 'core',
    squarePos: { top: '27%', left: '60%' },
    squareDelay: 1500,
    labelPos: { top: '11%', left: '26%' },
    labelAnim: 'lumen-slide-left',
    labelDelay: 1100,
    title: '[ CORE_ENTITY ]',
    desc: 'Neural node processing real-time data streams.',
    descMaxW: 160,
  },
  {
    id: 'luminous',
    squarePos: { top: '58%', left: '32%' },
    squareDelay: 1800,
    labelPos: { top: '76%', left: '3%' },
    labelAnim: 'lumen-slide-left',
    labelDelay: 1400,
    title: '[ LUMINOUS_INSIGHT ]',
    desc: 'Deep-learning engine synthesizing raw inputs.',
    descMaxW: 160,
  },
  {
    id: 'connect',
    squarePos: { top: '63%', left: '50%' },
    squareDelay: 2100,
    labelPos: { top: '50%', left: '78%' },
    labelAnim: 'lumen-slide-right',
    labelDelay: 1700,
    title: '[ CONNECTIVITY ]',
    desc: 'Latency-free transmission across distributed networks.',
    descMaxW: 180,
  },
] as const;

/* ─── Connector line configuration ─── */
const CONNECTOR_LINES = [
  { x1: '38%', y1: '14%', x2: '52%', y2: '14%', delay: 1200 },
  { x1: '52%', y1: '14%', x2: '60%', y2: '27%', delay: 1400 },
  { x1: '32%', y1: '58%', x2: '20%', y2: '74%', delay: 1500 },
  { x1: '20%', y1: '74%', x2: '6%',  y2: '74%', delay: 1700 },
  { x1: '78%', y1: '53%', x2: '63%', y2: '53%', delay: 1800 },
  { x1: '63%', y1: '53%', x2: '50%', y2: '63%', delay: 2000 },
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
        stroke="rgba(255,255,255,0.25)"
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
          className="absolute w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] border border-white/80 lumen-scale-in"
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
            className="text-white text-[13px] leading-[15.6px] whitespace-nowrap"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {node.title}
          </span>
          <p
            className="text-white/50 text-[11px] leading-[14px] mt-[4px]"
            style={{ maxWidth: node.descMaxW, fontFamily: "'Inter', sans-serif" }}
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
    <div className="absolute inset-0 z-10" aria-hidden="true">
      {/* Layer 0: Video / Poster — no scrim/overlay per spec §6 */}
      {isTouchDevice ? (
        /* Mobile: static poster — no video download */
        <img
          src="/videos/poster.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
      ) : (
        /* Desktop: autoplaying jellyfish video */
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_115057_94c3699b-0fd1-4124-bcf3-3626bb8c1f77.mp4"
          poster="/videos/poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover lumen-fade-in pointer-events-none"
        />
      )}

      {/* Layer 1: Grid lines + plus marks (above video, below content) */}
      <div className="absolute inset-0 z-[20]">
        <GridLines />
        <CentralNodes />
      </div>
    </div>
  );
});
