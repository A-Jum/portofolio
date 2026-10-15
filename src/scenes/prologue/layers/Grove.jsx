import { rng } from '../../../lib/rng.js'

const r = rng(17)

function leaf(x, y, len, ang) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const w = len * 0.16
  const p = (u, v) => `${(x + c * u - s * v).toFixed(1)} ${(y + s * u + c * v).toFixed(1)}`
  return `M${p(0, 0)} Q${p(len * 0.4, -w)} ${p(len, 0)} Q${p(len * 0.4, w)} ${p(0, 0)} Z`
}

const STALKS = [
  { x: 600, w: 20, top: -40, d: 0.0 },
  { x: 652, w: 26, top: -60, d: 0.6 },
  { x: 716, w: 22, top: -30, d: 1.3 },
  { x: 772, w: 30, top: -80, d: 0.3 },
  { x: 838, w: 24, top: -50, d: 1.9 },
  { x: 884, w: 28, top: -70, d: 0.9 },
  { x: 560, w: 14, top: 120, d: 2.4, back: true },
  { x: 690, w: 16, top: 60, d: 1.6, back: true },
  { x: 810, w: 16, top: 40, d: 2.8, back: true },
].map((s) => {
  const nodes = []
  for (let y = 1040; y > s.top + 40; y -= 96 + r() * 40) nodes.push(y)
  const leaves = []
  const n = s.back ? 5 : 9
  for (let i = 0; i < n; i++) {
    const y = s.top + 60 + r() * 420
    const side = r() < 0.5 ? -1 : 1
    leaves.push(leaf(s.x, y, 50 + r() * 50, side < 0 ? Math.PI * (0.78 + r() * 0.2) : Math.PI * (0.02 + r() * 0.2)))
  }
  return { ...s, nodes, leaves: leaves.join(' ') }
})

/** L7: near pagoda roof (left) and a bamboo stand (right); stalks sway at their base. */
export default function Grove() {
  return (
    <svg className="grove__svg" viewBox="0 0 900 1080" overflow="visible" aria-hidden="true" focusable="false">
      {STALKS.filter((s) => s.back).map((s) => (
        <g key={s.x} className="stalk" style={{ animationDelay: `-${s.d}s` }}>
          <rect x={s.x - s.w / 2} y={s.top} width={s.w} height={2400 - s.top} rx={s.w / 2} fill="#1a0406" />
          <path d={s.leaves} fill="#1a0406" />
        </g>
      ))}

      <g className="pagoda">
        <path fill="#0b0102" d="M70 690 L 550 690 L 550 2400 L 70 2400 Z" />
        {[96, 176, 256, 336, 416, 496].map((x) => (
          <rect key={x} x={x} y={704} width={16} height={1700} fill="#1a0406" />
        ))}
        <path fill="#140304" d="M60 690 L 560 690 L 560 712 L 60 712 Z" />
        <path fill="#140304" d="M40 840 L 580 840 L 580 852 L 40 852 Z M60 852 L 66 852 L 66 2400 L 60 2400 Z M554 852 L 560 852 L 560 2400 L 554 2400 Z" />
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={48 + i * 22} y={852} width={3} height={42} fill="#140304" />
        ))}
        <circle cx="300" cy="790" r="46" fill="#c8a24a" opacity="0.07" />
        <circle cx="300" cy="790" r="14" fill="#c8a24a" opacity="0.35" />
        <path fill="#070102" d="M30 690 Q 300 650 590 690 L 590 704 Q 300 672 30 704 Z" />
        <path
          fill="#100203"
          d="M64 568 L 556 568 C 580 610, 620 650, 690 664 C 700 666, 702 672, 694 676 C 640 680, 590 686, 560 694 L 60 694 C 30 686, -20 680, -74 676 C -82 672, -80 666, -70 664 C 0 650, 40 610, 64 568 Z"
        />
        <path fill="#060001" d="M54 548 L 566 548 L 572 572 L 48 572 Z" />
        <path fill="#060001" d="M34 528 Q 46 540 56 548 L 50 572 L 30 560 Z M586 528 Q 574 540 564 548 L 570 572 L 590 560 Z" />
        <path stroke="#d23a2a" strokeOpacity="0.55" strokeWidth="1.4" fill="none" d="M52 548 L 568 548 M64 570 C 40 610, 0 650, -70 664 M556 570 C 580 610, 620 650, 690 664" />
        <path stroke="#ecdfc7" strokeOpacity="0.05" fill="none" d="M120 580 L 100 688 M200 580 L 188 690 M280 580 L 276 690 M360 580 L 364 690 M440 580 L 452 690 M520 580 L 540 688" />
      </g>

      {STALKS.filter((s) => !s.back).map((s) => (
        <g key={s.x} className="stalk" style={{ animationDelay: `-${s.d}s` }}>
          <rect x={s.x - s.w / 2} y={s.top} width={s.w} height={2400 - s.top} rx={s.w / 2} fill="#110204" />
          <path d={`M${s.x - s.w / 2 + 1.5} ${s.top + 20} L${s.x - s.w / 2 + 1.5} 2400`} stroke="#8e1219" strokeOpacity="0.55" strokeWidth="1.2" />
          {s.nodes.map((y) => (
            <rect key={y} x={s.x - s.w / 2 - 2} y={y} width={s.w + 4} height={4} rx={2} fill="#070102" />
          ))}
          <path d={s.leaves} fill="#0d0203" />
        </g>
      ))}
    </svg>
  )
}
