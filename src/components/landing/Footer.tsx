import { COLORS } from './ui/theme';

export function Footer() {
  return (
    <footer
      style={{
        padding: "34px 5%",
        borderTop: `1px solid ${COLORS.line}`,
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: COLORS.secondary }}>DuoKarma © 2026</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.secondary }}>
        Built by DuoKarma, obviously.
      </div>
    </footer>
  );
}