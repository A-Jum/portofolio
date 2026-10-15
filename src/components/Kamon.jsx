/**
 * AI kamon: double ring around three nodes joined by swirling arms with 120° rotational symmetry,
 * a mitsudomoe read as a tiny neural network.
 */
export function KamonShape({ stroke = 'currentColor', fill = 'currentColor', ring = true }) {
  return (
    <g>
      {ring && (
        <>
          <circle r="46" fill="none" stroke={stroke} strokeWidth="3" />
          <circle r="40" fill="none" stroke={stroke} strokeWidth="1.4" />
        </>
      )}
      {[0, 120, 240].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -20 C 19 -31, 33 -5, 17.32 10" fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M0 -20 Q -7 -9 0 0" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <circle cy="-20" r="6.2" fill={fill} />
        </g>
      ))}
      <circle r="3" fill={fill} />
    </g>
  )
}

export default function Kamon({ size = 48, className = '', title, ...rest }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      {...rest}
    >
      <KamonShape />
    </svg>
  )
}
