/** Seeded PRNG (mulberry32) so procedural scenery is identical on every visit. */
export function rng(seed = 1) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth 1D value noise built from a seeded lattice. */
export function noise1D(seed = 1) {
  const r = rng(seed)
  const lattice = Array.from({ length: 256 }, () => r())
  return (x) => {
    const i = Math.floor(x)
    const f = x - i
    const a = lattice[i & 255]
    const b = lattice[(i + 1) & 255]
    const u = f * f * (3 - 2 * f)
    return a + (b - a) * u
  }
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
export const lerp = (a, b, t) => a + (b - a) * t
