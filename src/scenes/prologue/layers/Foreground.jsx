import { rng } from '../../../lib/rng.js'

const r = rng(29)
const GRASS = (() => {
  const blades = []
  for (let x = -20; x < 1940; x += 9 + r() * 14) {
    const h = 60 + r() * 140
    const lean = (r() - 0.3) * 60
    const w = 3 + r() * 5
    blades.push(`M${x.toFixed(0)} 1090 Q${(x + lean * 0.4).toFixed(0)} ${(1080 - h * 0.6).toFixed(0)} ${(x + lean).toFixed(0)} ${(1080 - h).toFixed(0)} Q${(x + lean * 0.4 + w).toFixed(0)} ${(1080 - h * 0.5).toFixed(0)} ${(x + w * 2).toFixed(0)} 1090 Z`)
  }
  return blades.join(' ')
})()

const LEAVES = Array.from({ length: 9 }, (_, i) => {
  const x = 1640 + r() * 320
  const y = -20 + r() * 160
  const len = 120 + r() * 120
  const a = Math.PI * (0.55 + r() * 0.35)
  const c = Math.cos(a)
  const s = Math.sin(a)
  const w = len * 0.15
  const p = (u, v) => `${(x + c * u - s * v).toFixed(0)} ${(y + s * u + c * v).toFixed(0)}`
  return <path key={i} d={`M${p(0, 0)} Q${p(len * 0.45, -w)} ${p(len, 0)} Q${p(len * 0.45, w)} ${p(0, 0)} Z`} />
})

/** L10: out-of-focus grass and bamboo leaves (static CSS blur). */
export default function Foreground() {
  return (
    <svg className="foreground" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path d={GRASS} fill="#060001" />
      <g fill="#070102">{LEAVES}</g>
    </svg>
  )
}
