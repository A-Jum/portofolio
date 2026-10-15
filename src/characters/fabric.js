/** Procedural cloth paths, regenerated each frame from a phase and an amplitude. */

const f = (n) => n.toFixed(1)

/** Ronin haori hem flap trailing behind the body (local units, facing right). */
export function hemPath(ph, amp) {
  const s1 = Math.sin(ph) * amp
  const s2 = Math.sin(ph * 1.7 + 1.3) * amp
  const s3 = Math.sin(ph * 0.9 + 2.1) * amp
  const tipX = 52 - amp * 7 - s1 * 6
  const tipY = 300 - amp * 6 + s2 * 4
  return (
    `M90 146 C ${f(76 - s3 * 3)} ${f(196 + s2)}, ${f(64 - s1 * 5 - amp * 3)} ${f(246 - amp * 3)}, ${f(tipX)} ${f(tipY)} ` +
    `L ${f(66 - s2 * 3 - amp * 2)} ${f(306 - amp * 2)} L ${f(80 - s1 * 3)} ${f(304 + s3 * 2)} ` +
    `C ${f(86 - s2 * 2)} ${f(262)}, 94 212, 104 160 Z`
  )
}

/**
 * Ninja headband tail: a tapered strip leaving the knot at (78, 30) and streaming back.
 * @param {number} ph phase
 * @param {number} amp flutter amplitude (rises when running)
 * @param {number} len length in local units
 * @param {number} lift vertical bias, negative lifts the tail
 */
export function ribbonPath(ph, amp, len, lift = 0) {
  const n = 7
  const top = []
  const bot = []
  for (let i = 0; i <= n; i++) {
    const k = i / n
    const x = 78 - k * len
    const wave = Math.sin(ph + k * 4.2) * amp * k * 7 + Math.sin(ph * 1.9 + k * 7) * amp * k * 2.5
    const y = 30 + k * (24 - amp * 9 + lift) + wave
    const w = 3.4 * (1 - k) + 1
    top.push(`${f(x)} ${f(y - w)}`)
    bot.unshift(`${f(x)} ${f(y + w)}`)
  }
  return `M${top.join(' L')} L${bot.join(' L')} Z`
}
