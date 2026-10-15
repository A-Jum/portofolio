import { MIYAKOBUSHI_CADENCE, MIYAKOBUSHI_D, semitone } from '../scales.js'
import { filter, noise, play, rand, route } from './voice.js'

/** One breathy shakuhachi note with a meri→kari pitch scoop and delayed vibrato. */
export function note(rig, t, freq, dur, { gain = 0.22 } = {}) {
  if (!rig.free()) return
  const { ctx } = rig
  const end = t + dur + 0.8

  // Occasional muraiki: a breath burst before the note.
  if (Math.random() < 0.2) {
    const b = noise(rig)
    const bp = filter(ctx, 'bandpass', freq * 2, 0.6)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t - 0.15)
    g.gain.linearRampToValueAtTime(0.35 * gain / 0.22, t - 0.05)
    g.gain.linearRampToValueAtTime(0.0001, t + 0.05)
    b.connect(bp).connect(g)
    route(rig, g, 'music', 0.4)
    play(rig, b, Math.max(ctx.currentTime, t - 0.15), t + 0.1)
  }

  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t)
  env.gain.linearRampToValueAtTime(gain, t + 0.25)
  env.gain.setValueAtTime(gain, t + dur)
  env.gain.linearRampToValueAtTime(0.0001, end)

  const lp = filter(ctx, 'lowpass', 2200, 0.5)
  lp.connect(env)

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 5
  const depth = ctx.createGain()
  depth.gain.setValueAtTime(0, t)
  depth.gain.setValueAtTime(0, t + 0.6)
  depth.gain.linearRampToValueAtTime(8, t + 1.2)
  lfo.connect(depth)

  for (const [type, level] of [['sine', 1], ['triangle', 0.3]]) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq / semitone, t)
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.18)
    depth.connect(osc.detune)
    const g = ctx.createGain()
    g.gain.value = level
    osc.connect(g).connect(lp)
    play(rig, osc, t, end)
  }
  play(rig, lfo, t, end)

  // Breath layer.
  const br = noise(rig, 'white', true)
  const bbp = filter(ctx, 'bandpass', freq * 2, 0.8)
  const bg = ctx.createGain()
  bg.gain.setValueAtTime(0.0001, t)
  bg.gain.linearRampToValueAtTime(0.25 * gain, t + 0.05)
  bg.gain.linearRampToValueAtTime(0.08 * gain, t + 0.35)
  bg.gain.setValueAtTime(0.08 * gain, t + dur)
  bg.gain.linearRampToValueAtTime(0.0001, end)
  br.connect(bbp).connect(bg).connect(env)
  play(rig, br, t, end)

  route(rig, env, 'music', 0.4)
}

/**
 * Builds a phrase: 3–6 notes, mostly stepwise, ending on D or A.
 * @returns {{ freq: number, dur: number }[]}
 */
export function phrase({ endOnD = false } = {}) {
  const n = 3 + Math.floor(Math.random() * 4)
  let i = Math.random() < 0.5 ? 0 : 3
  const out = []
  for (let k = 0; k < n; k++) {
    if (k === n - 1) {
      const targets = endOnD ? [0, 5] : MIYAKOBUSHI_CADENCE
      i = targets.reduce((best, c) => (Math.abs(c - i) < Math.abs(best - i) ? c : best), targets[0])
    } else if (k > 0) {
      const step = Math.random() < 0.75 ? (Math.random() < 0.5 ? -1 : 1) : (Math.random() < 0.5 ? -2 : 2)
      i = Math.min(MIYAKOBUSHI_D.length - 1, Math.max(0, i + step))
    }
    out.push({ freq: MIYAKOBUSHI_D[i], dur: k === n - 1 ? rand(1.8, 2.5) : rand(0.8, 2.0) })
  }
  return out
}

/** Schedules a whole phrase from `t` and returns its end time. */
export function playPhrase(rig, t, opts) {
  let at = t
  for (const { freq, dur } of phrase(opts)) {
    note(rig, at, freq, dur)
    at += dur + 0.12
  }
  return at + 0.8
}
