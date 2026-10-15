import { gsap } from '../lib/gsap.js'

/**
 * A pose maps rig part names to transforms. Missing parts fall back to 0.
 * Angles are degrees (SVG, clockwise positive) for a character facing right.
 * @typedef {{ rotate?: number, x?: number, y?: number }} PartPose
 * @typedef {Record<string, PartPose>} Pose
 * @typedef {Record<string, SVGGElement>} Rig
 */

/** Joint pivots in each character's own SVG units. */
export const RONIN_PIVOTS = {
  root: [110, 410],
  torso: [110, 208],
  head: [112, 96],
  'armR-upper': [128, 108],
  'armR-lower': [128, 176],
  handR: [128, 236],
  blade: [128, 236],
  'armL-upper': [96, 110],
  'armL-lower': [96, 176],
  haoriHem: [110, 208],
  hakamaL: [104, 214],
  hakamaR: [116, 214],
  saya: [118, 210],
}

export const NINJA_PIVOTS = {
  root: [90, 372],
  torso: [90, 178],
  head: [94, 66],
  'armR-upper': [98, 80],
  'armR-lower': [98, 146],
  'armL-upper': [84, 82],
  'armL-lower': [84, 148],
  'legR-upper': [94, 180],
  'legR-lower': [94, 272],
  'legL-upper': [86, 180],
  'legL-lower': [86, 272],
  sword: [90, 120],
}

/** @type {Record<string, Pose>} */
export const RONIN_POSES = {
  idle: {
    'armR-upper': { rotate: 4 },
    'armR-lower': { rotate: -12 },
    'armL-upper': { rotate: 6 },
    'armL-lower': { rotate: -24 },
    blade: { rotate: -80 },
  },
  grip: {
    torso: { rotate: 5 },
    head: { rotate: 4 },
    'armR-upper': { rotate: 6 },
    'armR-lower': { rotate: -66 },
    'armL-upper': { rotate: -6 },
    'armL-lower': { rotate: -40 },
    hakamaR: { rotate: -6 },
    hakamaL: { rotate: 5 },
    blade: { rotate: -80 },
  },
  draw: {
    torso: { rotate: -3 },
    head: { rotate: -4 },
    'armR-upper': { rotate: -112 },
    'armR-lower': { rotate: -26 },
    'armL-upper': { rotate: -10 },
    'armL-lower': { rotate: -50 },
    hakamaR: { rotate: -12 },
    hakamaL: { rotate: 10 },
    blade: { rotate: -18 },
  },
  dash: {
    root: { y: 18 },
    torso: { rotate: 26 },
    head: { rotate: -10 },
    'armR-upper': { rotate: 22 },
    'armR-lower': { rotate: 8 },
    'armL-upper': { rotate: -30 },
    'armL-lower': { rotate: -30 },
    hakamaR: { rotate: -20 },
    hakamaL: { rotate: 18 },
    haoriHem: { rotate: 14 },
    blade: { rotate: 62 },
  },
  afterCut: {
    root: { y: 14 },
    torso: { rotate: 14 },
    head: { rotate: 8 },
    'armR-upper': { rotate: -58 },
    'armR-lower': { rotate: -6 },
    'armL-upper': { rotate: 18 },
    'armL-lower': { rotate: -10 },
    hakamaR: { rotate: -16 },
    hakamaL: { rotate: 18 },
    haoriHem: { rotate: 6 },
    blade: { rotate: 26 },
  },

}

/** @type {Record<string, Pose>} */
export const NINJA_POSES = {
  stand: {
    'armR-upper': { rotate: 8 },
    'armR-lower': { rotate: -14 },
    'armL-upper': { rotate: -4 },
    'armL-lower': { rotate: -10 },
  },
  crouch: {
    root: { y: 74 },
    torso: { rotate: 34 },
    head: { rotate: -22 },
    'legR-upper': { rotate: -86 },
    'legR-lower': { rotate: 128 },
    'legL-upper': { rotate: -40 },
    'legL-lower': { rotate: 124 },
    'armR-upper': { rotate: -30 },
    'armR-lower': { rotate: -40 },
    'armL-upper': { rotate: 40 },
    'armL-lower': { rotate: -20 },
  },
  run1: {
    torso: { rotate: 22 },
    head: { rotate: -14 },
    'legR-upper': { rotate: -48 },
    'legR-lower': { rotate: 24 },
    'legL-upper': { rotate: 34 },
    'legL-lower': { rotate: 64 },
    'armR-upper': { rotate: 62 },
    'armR-lower': { rotate: -10 },
    'armL-upper': { rotate: 58 },
    'armL-lower': { rotate: -6 },
  },
  run2: {
    root: { y: -10 },
    torso: { rotate: 20 },
    head: { rotate: -12 },
    'legR-upper': { rotate: -8 },
    'legR-lower': { rotate: 12 },
    'legL-upper': { rotate: -4 },
    'legL-lower': { rotate: 104 },
    'armR-upper': { rotate: 66 },
    'armR-lower': { rotate: -8 },
    'armL-upper': { rotate: 62 },
    'armL-lower': { rotate: -4 },
  },
  run3: {
    torso: { rotate: 22 },
    head: { rotate: -14 },
    'legR-upper': { rotate: 34 },
    'legR-lower': { rotate: 64 },
    'legL-upper': { rotate: -48 },
    'legL-lower': { rotate: 24 },
    'armR-upper': { rotate: 58 },
    'armR-lower': { rotate: -6 },
    'armL-upper': { rotate: 62 },
    'armL-lower': { rotate: -10 },
  },
  run4: {
    root: { y: -10 },
    torso: { rotate: 20 },
    head: { rotate: -12 },
    'legR-upper': { rotate: -4 },
    'legR-lower': { rotate: 104 },
    'legL-upper': { rotate: -8 },
    'legL-lower': { rotate: 12 },
    'armR-upper': { rotate: 62 },
    'armR-lower': { rotate: -4 },
    'armL-upper': { rotate: 66 },
    'armL-lower': { rotate: -8 },
  },
  leap: {
    torso: { rotate: 28 },
    head: { rotate: -18 },
    'legR-upper': { rotate: -76 },
    'legR-lower': { rotate: 96 },
    'legL-upper': { rotate: -26 },
    'legL-lower': { rotate: 112 },
    'armR-upper': { rotate: 76 },
    'armR-lower': { rotate: -12 },
    'armL-upper': { rotate: 80 },
    'armL-lower': { rotate: -8 },
  },
  land: {
    root: { y: 52 },
    torso: { rotate: 30 },
    head: { rotate: -20 },
    'legR-upper': { rotate: -70 },
    'legR-lower': { rotate: 104 },
    'legL-upper': { rotate: -24 },
    'legL-lower': { rotate: 96 },
    'armR-upper': { rotate: -64 },
    'armR-lower': { rotate: -10 },
    'armL-upper': { rotate: 70 },
    'armL-lower': { rotate: -10 },
  },
  windup: {
    torso: { rotate: -10 },
    head: { rotate: 4 },
    'legR-upper': { rotate: -22 },
    'legR-lower': { rotate: 14 },
    'legL-upper': { rotate: 18 },
    'legL-lower': { rotate: 10 },
    'armR-upper': { rotate: 120 },
    'armR-lower': { rotate: -50 },
    'armL-upper': { rotate: -70 },
    'armL-lower': { rotate: -10 },
  },
  throw: {
    torso: { rotate: 18 },
    head: { rotate: -10 },
    'legR-upper': { rotate: -30 },
    'legR-lower': { rotate: 20 },
    'legL-upper': { rotate: 24 },
    'legL-lower': { rotate: 16 },
    'armR-upper': { rotate: -84 },
    'armR-lower': { rotate: -6 },
    'armL-upper': { rotate: 40 },
    'armL-lower': { rotate: -10 },
  },
  dash: {
    root: { y: 30 },
    torso: { rotate: 40 },
    head: { rotate: -28 },
    'legR-upper': { rotate: -62 },
    'legR-lower': { rotate: 46 },
    'legL-upper': { rotate: 52 },
    'legL-lower': { rotate: 50 },
    'armR-upper': { rotate: 84 },
    'armR-lower': { rotate: 0 },
    'armL-upper': { rotate: 80 },
    'armL-lower': { rotate: 0 },
  },
}

export const RUN_CYCLE = ['run1', 'run2', 'run3', 'run4']

/**
 * Collects `[data-part]` groups into a rig. Each entry keeps its element and pivot;
 * transforms are written as SVG attributes so nested joints rotate about their own pivots.
 * @returns {Record<string, { el: SVGGElement, pivot: [number, number] }>}
 */
export function buildRig(svg, pivots) {
  const rig = {}
  svg.querySelectorAll('[data-part]').forEach((el) => {
    const name = el.getAttribute('data-part')
    if (pivots[name]) rig[name] = { el, pivot: pivots[name] }
  })
  return rig
}

const val = (pose, part, key) => pose?.[part]?.[key] ?? 0

/** Linear blend between two poses at t (0..1). */
export function blendPose(a, b, t) {
  /** @type {Pose} */
  const out = {}
  const parts = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
  for (const part of parts) {
    out[part] = {
      rotate: val(a, part, 'rotate') + (val(b, part, 'rotate') - val(a, part, 'rotate')) * t,
      x: val(a, part, 'x') + (val(b, part, 'x') - val(a, part, 'x')) * t,
      y: val(a, part, 'y') + (val(b, part, 'y') - val(a, part, 'y')) * t,
    }
  }
  return out
}

/** Apply a pose immediately. Parts absent from the pose reset to neutral. */
export function setPose(rig, pose) {
  for (const [part, { el, pivot }] of Object.entries(rig)) {
    const r = val(pose, part, 'rotate')
    const x = val(pose, part, 'x')
    const y = val(pose, part, 'y')
    el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)} ${pivot[0]} ${pivot[1]})`)
  }
}

/** Tween a rig from one pose to another. Returns the tween so it can be nested. */
export function toPose(rig, from, to, duration = 0.4, ease = 'power2.inOut') {
  const p = { t: 0 }
  return gsap.to(p, { t: 1, duration, ease, onUpdate: () => setPose(rig, blendPose(from, to, p.t)) })
}

/**
 * Pose at progress `p` along keyframes `[[p0, 'poseA'], [p1, 'poseB'], ...]`, eased between neighbours.
 * A keyframe name may be 'run' to use the run cycle with `cycles` loops across its span.
 */
export function poseAt(keys, poses, p) {
  if (p <= keys[0][0]) return poses[keys[0][1]]
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, n0, opts] = keys[i]
    const [p1, n1] = keys[i + 1]
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0 || 1)
      if (n0 === 'run') {
        const f = t * (opts?.cycles ?? 2) * RUN_CYCLE.length
        const i0 = Math.floor(f) % RUN_CYCLE.length
        const i1 = (i0 + 1) % RUN_CYCLE.length
        return blendPose(poses[RUN_CYCLE[i0]], poses[RUN_CYCLE[i1]], f - Math.floor(f))
      }
      const e = t * t * (3 - 2 * t)
      return blendPose(poses[n0], poses[n1 === 'run' ? RUN_CYCLE[0] : n1], e)
    }
  }
  return poses[keys[keys.length - 1][1]]
}
