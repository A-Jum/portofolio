import { noise1D } from '../../../lib/rng.js'

function ridge(seed, base, amp, freq, sharp) {
  const n = noise1D(seed)
  const pts = []
  for (let x = -40; x <= 1960; x += 16) {
    const v = n(x * freq) * 0.65 + n(x * freq * 2.7 + 9) * 0.35
    const y = base - Math.pow(v, sharp) * amp
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return `M-40 1080 L${pts.join(' L')} L1960 1080 Z`
}

const RIDGES = [
  { d: ridge(41, 760, 420, 0.0024, 1.6), fill: '#4a0d12', id: 'far' },
  { d: ridge(42, 830, 330, 0.0034, 1.3), fill: '#330709', id: 'mid' },
  { d: ridge(43, 900, 230, 0.0046, 1.1), fill: '#220406', id: 'near' },
]

/** L3: sumi-e mountain ridges from seeded noise, each fading into mist at its foot. */
export default function Mountains() {
  return (
    <svg className="mountains" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        {RIDGES.map((r) => (
          <linearGradient key={r.id} id={`ridge-${r.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor={r.fill} />
            <stop offset="0.95" stopColor={r.fill} stopOpacity="0.15" />
          </linearGradient>
        ))}
      </defs>
      {RIDGES.map((r) => (
        <path key={r.id} d={r.d} fill={`url(#ridge-${r.id})`} />
      ))}
    </svg>
  )
}
