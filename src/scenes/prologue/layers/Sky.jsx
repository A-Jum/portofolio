import { rng } from '../../../lib/rng.js'

const r = rng(3)
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({
  cx: 200 + r() * 1600,
  cy: 120 + r() * 380,
  rx: 220 + r() * 380,
  ry: 14 + r() * 26,
  o: 0.18 + r() * 0.2,
  k: i,
}))

/** L0: sky gradient (CSS) and thin streaked clouds blurred once. */
export default function Sky() {
  return (
    <svg className="sky__clouds" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id="cloud-blur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter="url(#cloud-blur)">
        {CLOUDS.map((c) => (
          <ellipse key={c.k} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="#5a1418" opacity={c.o} />
        ))}
      </g>
    </svg>
  )
}
