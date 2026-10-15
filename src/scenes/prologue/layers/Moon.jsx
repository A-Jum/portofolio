/** L1: the blood moon. Texture comes from a feTurbulence filter rendered once (never animated). */
export default function Moon() {
  return (
    <div className="moon">
      <div className="moon__halo" />
      <svg className="moon__disc" viewBox="-110 -110 220 220" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="moon-fill" cx="42%" cy="38%" r="70%">
            <stop offset="0" stopColor="#b8262a" />
            <stop offset="0.55" stopColor="#8e1219" />
            <stop offset="1" stopColor="#4e080c" />
          </radialGradient>
          <filter id="moon-tex" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.01  0 0 0 0 0.02  0 0 0 1.4 -0.55" result="spots" />
            <feComposite in="spots" in2="SourceGraphic" operator="in" result="clipped" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="clipped" />
            </feMerge>
          </filter>
        </defs>
        <circle r="100" fill="url(#moon-fill)" filter="url(#moon-tex)" />
        <circle r="99" fill="none" stroke="#d23a2a" strokeOpacity="0.35" strokeWidth="1.2" />
      </svg>
    </div>
  )
}
