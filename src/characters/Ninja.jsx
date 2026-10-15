import { useId } from 'react'
import { ribbonPath } from './fabric.js'

const C = {
  near: '#140d10',
  far: '#0a0607',
  band: '#6e0f14',
  eye: '#d23a2a',
}

/**
 * The ninja: slim shinobi rig drawn facing right, displayed facing left by default.
 * Pose values are authored for "facing right"; the mirror is a static outer transform.
 */
export default function Ninja({ className = '', svgRef, faceLeft = true, rim = '#d23a2a' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg ref={svgRef} className={className} viewBox="0 0 180 380" overflow="visible" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`nrim-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feOffset in="SourceAlpha" dx={faceLeft ? 1.4 : -1.4} dy="1.2" result="shift" />
          <feComposite in="SourceAlpha" in2="shift" operator="out" result="edge" />
          <feFlood floodColor={rim} floodOpacity="0.9" />
          <feComposite in2="edge" operator="in" result="rim" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="rim" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#nrim-${id})`}>
        <g transform={faceLeft ? 'translate(180 0) scale(-1 1)' : undefined}>
          <g data-part="root">
            <g data-part="armL-upper">
              <path fill={C.far} d="M74 76 C 86 72, 96 76, 94 90 L 91 150 L 76 150 Z" />
              <g data-part="armL-lower">
                <path fill={C.far} d="M77 142 L 91 142 L 89 206 L 79 206 Z" />
                <path fill={C.far} d="M78 200 C 78 196, 92 196, 92 202 L 91 217 L 79 217 Z" />
              </g>
            </g>
            <g data-part="legL-upper">
              <path fill={C.far} d="M72 170 C 70 210, 74 250, 77 278 L 95 278 C 98 248, 100 210, 100 170 Z" />
              <g data-part="legL-lower">
                <path fill={C.far} d="M77 266 C 78 300, 79 330, 80 360 L 93 360 C 94 330, 96 300, 96 266 Z" />
                <path fill={C.far} d="M78 352 L 94 352 C 103 356, 110 360, 113 366 L 113 373 L 77 373 Z" />
              </g>
            </g>

            <g data-part="torso">
              <g data-part="sword">
                <path stroke="#060405" strokeWidth="6.5" strokeLinecap="round" d="M60 172 L 114 52" />
                <path stroke="#3a0a0c" strokeWidth="5" strokeLinecap="round" d="M116 47 L 127 23" />
                <path fill="#1b1410" stroke="#c8a24a" strokeOpacity="0.5" strokeWidth="0.6" d="M108 50 L 120 44 L 123 51 L 111 57 Z" />
              </g>
              <path fill={C.near} d="M68 180 C 62 150, 62 108, 70 80 Q 92 64, 116 78 C 122 108, 120 150, 112 180 Z" />
              <path stroke="#ecdfc7" strokeOpacity="0.06" fill="none" d="M82 92 L 102 132 M80 120 L 98 160" />
              <path fill="#3b0a0d" d="M66 164 L 115 162 L 114 175 L 67 177 Z" />
              <path fill="#0a0708" stroke="#a08f86" strokeOpacity="0.25" strokeWidth="0.5" d="M100 158 L 112 158 L 112 172 L 100 172 Z" />
              <g data-part="head">
                <path data-part="ribbonB" fill={C.band} opacity="0.85" d={ribbonPath(1.3, 0.6, 70, 8)} />
                <path data-part="ribbonA" fill={C.band} d={ribbonPath(0, 0.6, 86, 0)} />
                <path fill={C.near} d="M76 40 C 76 20, 92 12, 103 14 C 116 16, 120 32, 118 46 C 118 60, 108 68, 96 69 C 85 69, 76 57, 76 40 Z" />
                <path fill={C.band} d="M78 30 L 116 25 L 117 31 L 79 36 Z" />
                <path fill="#2a0709" d="M100 37 L 116 35 L 116 40 L 101 41 Z" />
                <path stroke={C.eye} strokeWidth="0.9" strokeLinecap="round" d="M103 38.6 L 114 37.2" />
                <circle cx="78" cy="33" r="3.4" fill={C.band} />
              </g>
            </g>

            <g data-part="legR-upper">
              <path fill={C.near} d="M80 170 C 78 210, 82 250, 85 278 L 103 278 C 106 248, 108 210, 108 170 Z" />
              <g data-part="legR-lower">
                <path fill={C.near} d="M85 266 C 86 300, 87 330, 88 360 L 101 360 C 102 330, 104 300, 104 266 Z" />
                <path stroke="#ecdfc7" strokeOpacity="0.07" fill="none" d="M88 290 L 101 296 M88 310 L 100 316 M89 330 L 100 336" />
                <path fill={C.near} d="M86 352 L 102 352 C 111 356, 118 360, 121 366 L 121 373 L 85 373 Z" />
              </g>
            </g>
            <g data-part="armR-upper">
              <path fill={C.near} d="M88 74 C 100 70, 112 76, 110 90 L 106 150 L 91 150 Z" />
              <g data-part="armR-lower">
                <path fill={C.near} d="M91 142 L 106 142 L 104 206 L 93 206 Z" />
                <path fill={C.near} d="M92 200 C 92 196, 106 196, 106 202 L 105 217 L 93 217 Z" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
