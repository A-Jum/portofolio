import { KamonShape } from './Kamon.jsx'

/** Ensō brushed in step with loading progress; the kamon settles in the centre. */
export default function Loader({ progress, leaving }) {
  const p = Math.max(0, Math.min(1, progress))
  return (
    <div className={`loader ${leaving ? 'is-leaving' : ''}`} role="status" aria-live="polite">
      <svg className="loader__enso" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">
        <path
          d="M 6 -46 A 46 46 0 1 1 -14 -43.8"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - p}
          fill="none"
          stroke="#8e1219"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 8 -44 A 44 44 0 1 1 -12 -42.5"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - p}
          fill="none"
          stroke="#d23a2a"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g transform="scale(0.42)" opacity={p} style={{ color: '#c8a24a' }}>
          <KamonShape />
        </g>
      </svg>
      <span className="sr-only">Loading {Math.round(p * 100)} percent</span>
    </div>
  )
}
