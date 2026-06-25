// ═══════════════════════════════════════════════════════════════
//  The Sigil — a radiant cross / Chi-Rho, the seal of the Sanctuary.
// ═══════════════════════════════════════════════════════════════

export default function Sigil({ size = 54, glow = true }: { size?: number; glow?: boolean }) {
  const id = "sig" + Math.round(size);
  return (
    <svg
      className="brand-sigil"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ filter: glow ? undefined : "none" }}
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#fff4cf" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#e6c34a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4e3a0" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9a7a1c" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="50" cy="44" r="46" fill={`url(#${id}-glow)`} />

      {/* radiant rays */}
      <g stroke={`url(#${id}-gold)`} strokeWidth="1.4" opacity="0.85">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r1 = 30, r2 = 42;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r1}
              y1={44 + Math.sin(a) * r1}
              x2={50 + Math.cos(a) * r2}
              y2={44 + Math.sin(a) * r2}
            />
          );
        })}
      </g>

      {/* ring */}
      <circle cx="50" cy="44" r="27" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6" opacity="0.6" />

      {/* the cross */}
      <g fill={`url(#${id}-gold)`}>
        <rect x="46.4" y="20" width="7.2" height="56" rx="2" />
        <rect x="34" y="38" width="32" height="7" rx="2" />
      </g>

      {/* Chi-Rho loop hint (the P) */}
      <path
        d="M50 20 q13 2 13 13 q0 11 -13 12"
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* center jewel */}
      <circle cx="50" cy="42" r="3.4" fill="#fff4cf" />
    </svg>
  );
}
