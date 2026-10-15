/** Builds one castle tier: wall plus a roof with upturned eaves and a small gable. */
function tier(cx, y, w, wallH, roofH, gable) {
  const hw = w / 2
  const ew = hw + 18
  const wall = `M${cx - hw + 6} ${y} L${cx + hw - 6} ${y} L${cx + hw - 6} ${y + wallH} L${cx - hw + 6} ${y + wallH} Z`
  const roof =
    `M${cx - ew - 6} ${y - 2} Q${cx - ew + 4} ${y - 4}, ${cx - hw + 8} ${y - roofH * 0.55} ` +
    `L${cx - hw * 0.55} ${y - roofH} L${cx + hw * 0.55} ${y - roofH} L${cx + hw - 8} ${y - roofH * 0.55} ` +
    `Q${cx + ew - 4} ${y - 4}, ${cx + ew + 6} ${y - 2} L${cx + ew - 4} ${y + 4} L${cx - ew + 4} ${y + 4} Z`
  const g = gable
    ? `M${cx - 22} ${y - roofH * 0.6} L${cx} ${y - roofH - 16} L${cx + 22} ${y - roofH * 0.6} Z`
    : ''
  return { wall, roof, g }
}

const TIERS = [
  tier(470, 262, 190, 40, 30, true),
  tier(470, 200, 156, 32, 28, false),
  tier(470, 146, 120, 28, 26, true),
  tier(470, 98, 86, 24, 24, false),
]

/** L4: castle keep on a far ridge, with a torii on the hill to its left. */
export default function Castle() {
  return (
    <svg className="castle" viewBox="0 0 700 420" aria-hidden="true" focusable="false">
      <path fill="#1a0305" d="M0 420 L0 352 C 90 330, 170 312, 260 318 C 340 300, 420 296, 520 300 C 600 306, 660 318, 700 330 L700 420 Z" />
      <path fill="#1a0305" d="M372 306 L568 306 L556 270 L384 270 Z" />
      {TIERS.map((t, i) => (
        <g key={i} fill="#170304">
          <path d={t.wall} />
          <path d={t.roof} />
          {t.g && <path d={t.g} />}
        </g>
      ))}
      <path fill="#170304" d="M462 48 L478 48 L476 74 L464 74 Z M458 52 Q 452 40 458 34 M482 52 Q 488 40 482 34" />
      <rect x="440" y="218" width="5" height="6" fill="#c8a24a" opacity="0.55" />
      <rect x="494" y="160" width="4" height="5" fill="#c8a24a" opacity="0.4" />
      <g fill="#1c0305">
        <path d="M150 268 Q 196 258, 246 268 L 244 275 Q 196 266, 152 275 Z" />
        <rect x="158" y="282" width="80" height="5" />
        <rect x="166" y="270" width="7" height="58" />
        <rect x="222" y="270" width="7" height="58" />
      </g>
    </svg>
  )
}
