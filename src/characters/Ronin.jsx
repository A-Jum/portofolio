import { useId } from 'react'
import { KamonShape } from '../components/Kamon.jsx'
import { hemPath } from './fabric.js'

const C = {
  body: '#090203',
  haori: '#2c080b',
  haoriBack: '#1f0507',
  hakama: '#100304',
  kasa: '#2a140c',
  weave: '#8a6440',
  wrap: '#7a1016',
  steel: '#d8d0c4',
}

/** Kasa weave: radial strands from the apex to the brim. */
const WEAVE = Array.from({ length: 11 }, (_, i) => {
  const x = 42 + i * 14.2
  const y = 70 - Math.sin((i / 10) * Math.PI) * 10 + i * 0.4
  return `M112 16 L${x.toFixed(1)} ${y.toFixed(1)}`
}).join(' ')

/**
 * The ronin: silhouette rig facing right, rim-lit from the moon (upper right).
 * Parts are `<g data-part>` groups whose pivots live in poses.js.
 */
export default function Ronin({ className = '', svgRef, rim = '#d23a2a' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 240 420"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`rim-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feOffset in="SourceAlpha" dx="-1.6" dy="1.4" result="shift" />
          <feComposite in="SourceAlpha" in2="shift" operator="out" result="edge" />
          <feFlood floodColor={rim} floodOpacity="0.95" />
          <feComposite in2="edge" operator="in" result="rim" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="rim" />
          </feMerge>
        </filter>
        <linearGradient id={`gleam-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff8e6" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`steel-${id}`}>
          <path d="M125.5 266 L130.5 266 C 134 330, 135 392, 129 450 L 125 444 C 128 392, 128 330, 125.5 266 Z" />
        </clipPath>
      </defs>

      <g filter={`url(#rim-${id})`}>
        <g data-part="root">
          <g data-part="hakamaL">
            <path fill={C.hakama} d="M92 206 C 90 262, 70 332, 42 404 L 40 410 L 100 410 C 104 360, 112 300, 124 206 Z" />
            <path fill={C.body} d="M54 405 L 86 405 L 88 413 L 52 413 Z" />
            <path stroke="#ecdfc7" strokeOpacity="0.06" fill="none" d="M100 230 L 76 400 M110 232 L 92 402" />
          </g>

          <g data-part="haoriHem">
            <path data-fabric="hem" fill={C.haoriBack} d={hemPath(0, 1)} />
          </g>

          <g data-part="armL-upper">
            <path fill={C.haoriBack} d="M86 104 C 70 112, 64 140, 68 196 C 80 206, 98 206, 108 196 L 106 128 Z" />
            <g data-part="armL-lower">
              <path fill={C.body} d="M90 172 L 102 172 L 104 226 L 92 228 Z" />
              <path fill={C.body} d="M90 224 Q 98 220 105 225 L 105 236 Q 98 240 90 236 Z" />
            </g>
          </g>

          <g data-part="hakamaR">
            <path fill={C.hakama} d="M100 206 L 128 206 C 136 280, 152 340, 178 404 L 180 410 L 112 410 C 112 350, 104 290, 100 206 Z" />
            <path fill={C.body} d="M150 405 L 180 405 L 184 413 L 148 413 Z" />
            <path stroke="#ecdfc7" strokeOpacity="0.06" fill="none" d="M116 230 L 134 402 M124 228 L 154 400" />
          </g>

          <g data-part="torso">
            <g className="ronin__breath">
              <path fill={C.body} d="M86 212 C 82 170, 80 130, 84 104 Q 110 92, 138 104 C 142 130, 140 170, 136 212 Z" />
              <path
                fill={C.haori}
                d="M78 104 Q 108 88 142 102 C 150 150 154 230 160 298 L 134 304 C 131 270 129 240 129 216 L 128 132 L 118 112 L 98 116 L 94 216 C 92 250 90 280 88 304 L 58 298 C 64 230 70 150 78 104 Z"
              />
              <path stroke="#ecdfc7" strokeOpacity="0.07" fill="none" d="M84 140 C 80 200, 76 250, 70 292 M146 150 C 148 210, 152 260, 154 296" />
              <path fill="#1a0507" d="M95 198 L 130 198 L 130 214 L 95 214 Z" />
              <path stroke="#c8a24a" strokeOpacity="0.55" strokeWidth="0.8" d="M96 206 L 129 206" />
              <g transform="translate(86 146) scale(0.13)" opacity="0.5">
                <KamonShape stroke="#c8a24a" fill="#c8a24a" />
              </g>
              <path fill={C.body} d="M104 84 L 121 84 L 122 102 L 103 102 Z" />
              <g data-part="head">
                <path fill={C.body} d="M99 62 C 99 80, 104 92, 114 95 C 125 95, 129 84, 129 68 Z" />
                <path stroke="#ecdfc7" strokeOpacity="0.25" strokeWidth="0.6" fill="none" d="M101 70 L 110 92 L 127 70" />
                <path fill={C.kasa} d="M32 68 Q 70 50, 112 13 Q 152 48, 194 72 Q 190 78, 180 76 Q 112 60, 44 74 Q 34 74, 32 68 Z" />
                <path d={WEAVE} stroke={C.weave} strokeOpacity="0.32" strokeWidth="0.7" fill="none" />
                <path d="M40 71 Q 112 57, 186 75" stroke={C.weave} strokeOpacity="0.4" strokeWidth="0.8" fill="none" />
              </g>
            </g>
          </g>

          <g data-part="saya">
            <path fill="#040101" d="M120 205 L 28 250 L 26 256 L 122 214 Z" />
            <path stroke="#6b1a1d" strokeOpacity="0.7" strokeWidth="0.7" d="M118 207 L 30 251" />
            <g data-sheathed="">
              <path fill={C.wrap} d="M122 205 L 176 187 L 179 194 L 124 213 Z" />
              <path stroke="#050101" strokeWidth="0.9" fill="none" d="M132 203 L 136 209 M142 199 L 146 206 M152 196 L 156 203 M162 193 L 166 199" />
              <ellipse cx="122" cy="209" rx="2.6" ry="9.5" transform="rotate(-20 122 209)" fill="#1b1410" stroke="#c8a24a" strokeOpacity="0.6" strokeWidth="0.6" />
            </g>
          </g>

          <g data-part="armR-upper">
            <path fill={C.haori} d="M118 100 C 140 100, 152 120, 152 150 L 156 196 C 142 206, 124 206, 112 196 L 113 138 Z" />
            <path stroke="#ecdfc7" strokeOpacity="0.07" fill="none" d="M142 120 C 146 150, 148 176, 150 194" />
            <g data-part="armR-lower">
              <path fill={C.body} d="M122 172 L 134 172 L 133 232 L 123 232 Z" />
              <g data-part="handR">
                <g data-part="blade" data-held="" opacity="0">
                  <path fill={C.wrap} d="M125 220 L 131 220 L 131 262 L 125 262 Z" />
                  <path stroke="#050101" strokeWidth="0.9" fill="none" d="M125 228 L 131 234 M125 240 L 131 246 M125 252 L 131 258" />
                  <ellipse cx="128" cy="263" rx="9.5" ry="2.6" fill="#1b1410" stroke="#c8a24a" strokeOpacity="0.6" strokeWidth="0.6" />
                  <path fill={C.steel} d="M125.5 266 L 130.5 266 C 134 330, 135 392, 129 450 L 125 444 C 128 392, 128 330, 125.5 266 Z" />
                  <path stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" fill="none" d="M130 270 C 133 330, 134 392, 129 448" />
                  <g clipPath={`url(#steel-${id})`}>
                    <rect data-gleam="" x="118" y="200" width="24" height="60" fill={`url(#gleam-${id})`} />
                  </g>
                </g>
                <path fill={C.body} d="M121 228 Q 128 224 135 229 L 135 242 Q 128 246 121 242 Z" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
