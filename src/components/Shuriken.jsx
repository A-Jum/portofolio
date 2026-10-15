/** Four-point shuriken with a centre hole. */
export default function Shuriken({ size = 40, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="-20 -20 40 40" aria-hidden="true" focusable="false">
      <path
        d="M0 -19 L 4 -4 L 19 0 L 4 4 L 0 19 L -4 4 L -19 0 L -4 -4 Z"
        fill="#2a2426"
        stroke="#a08f86"
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
      <path d="M0 -19 L 4 -4 L 0 0 Z M19 0 L 4 4 L 0 0 Z M0 19 L -4 4 L 0 0 Z M-19 0 L -4 -4 L 0 0 Z" fill="#ecdfc7" opacity="0.12" />
      <circle r="3.2" fill="#1f0507" stroke="#a08f86" strokeOpacity="0.5" strokeWidth="0.6" />
    </svg>
  )
}
