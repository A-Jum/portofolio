/** Simple crow silhouette with a two-frame wing flap (CSS steps). */
export default function Crow({ className = '', style }) {
  return (
    <svg className={`crow ${className}`} style={style} viewBox="0 0 60 30" aria-hidden="true" focusable="false">
      <g fill="#070102">
        <path d="M24 16 C 28 13, 34 13, 38 15 L 46 13 L 40 17 C 38 20, 30 21, 24 19 L 16 21 L 20 17 Z" />
        <path className="crow__up" d="M30 15 C 26 6, 18 2, 8 2 C 16 6, 22 11, 26 16 Z M34 15 C 38 6, 46 3, 54 4 C 46 8, 40 12, 36 16 Z" />
        <path className="crow__down" d="M30 17 C 24 22, 16 26, 6 27 C 14 22, 22 18, 27 16 Z M34 17 C 40 22, 48 25, 56 25 C 48 21, 41 18, 36 16 Z" />
      </g>
    </svg>
  )
}
