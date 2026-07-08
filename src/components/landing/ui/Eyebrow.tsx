import React from 'react';
import { COLORS } from './theme';

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: COLORS.accent,
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ width: 22, height: 1, background: COLORS.accent, display: "inline-block" }} />
      {children}
    </div>
  );
}