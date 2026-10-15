import { KamonShape } from '../components/Kamon.jsx'

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

/** Small original ink emblems for each deed (decorative). */
export default function InkGlyph({ kind }) {
  let body
  switch (kind) {
    case 'mask':
      body = (
        <>
          <path {...S} d="M6 14 V6 H14 M34 6 H42 V14 M42 34 V42 H34 M14 42 H6 V34" />
          <path {...S} d="M24 11 C 32 11, 35 18, 34 25 C 33 33, 28 38, 24 38 C 20 38, 15 33, 14 25 C 13 18, 16 11, 24 11 Z" />
          <path {...S} strokeWidth="1.6" d="M18 23 L 22 22 M26 22 L 30 23 M21 31 Q 24 33 27 31" />
          <path stroke="#d23a2a" strokeWidth="1.2" d="M8 24 H40" opacity="0.8" />
        </>
      )
      break
    case 'letter':
      body = (
        <>
          <path {...S} d="M8 12 H30 V38 H8 Z M8 12 C 4 12, 4 18, 8 18 M30 38 C 34 38, 34 32, 30 32" />
          <path {...S} strokeWidth="1.4" d="M12 20 H26 M12 25 H24 M12 30 H22" />
          <path {...S} d="M30 8 C 38 6, 44 10, 43 15 C 42 20, 36 21, 32 19 L 28 22 L 30 17 C 28 13, 27 9, 30 8 Z" />
        </>
      )
      break
    case 'river':
      body = (
        <>
          <path {...S} d="M2 36 C 10 30, 16 40, 24 34 C 32 28, 38 38, 46 32" />
          <path {...S} strokeWidth="1.3" d="M2 42 C 10 36, 16 46, 24 40 C 32 34, 38 44, 46 38" opacity="0.6" />
          {[8, 22, 36].map((x) => (
            <path key={x} {...S} strokeWidth="1.6" d={`M${x - 5} 12 Q ${x} 10 ${x + 5} 12 M${x - 4} 15 H${x + 4} M${x - 3} 12 V30 M${x + 3} 12 V30`} />
          ))}
        </>
      )
      break
    case 'kamon':
      body = (
        <>
          <g transform="translate(17 24) scale(0.15)">
            <KamonShape />
          </g>
          <g transform="translate(31 24) scale(0.15)" opacity="0.85">
            <KamonShape />
          </g>
        </>
      )
      break
    case 'nobori':
      body = (
        <>
          <path {...S} d="M14 4 V46 M14 6 H34 M14 10 H34" />
          <path {...S} d="M16 10 H32 V40 L 26 36 L 20 40 L 16 38 Z" />
          <path stroke="#d23a2a" strokeWidth="2.4" strokeLinecap="round" d="M24 16 V30" />
        </>
      )
      break
    default:
      body = <circle cx="24" cy="24" r="3" fill="currentColor" />
  }
  return (
    <svg className="glyph" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false">
      {body}
    </svg>
  )
}
