import { big } from './taiko.js'
import { filter, noise, perc, play, rand, route } from './voice.js'

function blip(rig, t, freq, peak, decay, { type = 'sine', bus = 'sfx', reverb = 0 } = {}) {
  const o = rig.ctx.createOscillator()
  o.type = type
  o.frequency.value = freq
  const env = perc(rig.ctx, t, peak, decay)
  o.connect(env)
  route(rig, env, bus, reverb)
  play(rig, o, t, t + decay + 0.02)
  return o
}

function burst(rig, t, type, freq, Q, peak, decay, { noiseType = 'white', reverb = 0 } = {}) {
  const n = noise(rig, noiseType)
  const f = filter(rig.ctx, type, freq, Q)
  const env = perc(rig.ctx, t, peak, decay)
  n.connect(f).connect(env)
  route(rig, env, 'sfx', reverb)
  play(rig, n, t, t + decay + 0.02)
}

/** Bandpassed noise with a swept centre frequency and a pan sweep. */
function sweep(rig, t, { from, peak, to, back, dur, gain = 0.6, pan = true, rate }) {
  const { ctx } = rig
  const n = noise(rig, 'white', true)
  if (rate) {
    n.playbackRate.setValueAtTime(rate[0], t)
    n.playbackRate.exponentialRampToValueAtTime(rate[1], t + dur)
  }
  const bp = filter(ctx, 'bandpass', from, 1.4)
  bp.frequency.setValueAtTime(from, t)
  if (back != null) {
    bp.frequency.exponentialRampToValueAtTime(peak, t + dur / 2)
    bp.frequency.exponentialRampToValueAtTime(back, t + dur)
  } else bp.frequency.exponentialRampToValueAtTime(to, t + dur)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t)
  env.gain.linearRampToValueAtTime(gain, t + dur * 0.45)
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  n.connect(bp).connect(env)
  let out = env
  if (pan && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner()
    p.pan.setValueAtTime(-0.9, t)
    p.pan.linearRampToValueAtTime(0.9, t + dur)
    env.connect(p)
    out = p
  }
  route(rig, out, 'sfx', 0.25)
  play(rig, n, t, t + dur + 0.05)
}

/** @type {Record<string, (rig: import('./voice.js').Rig, t: number) => void>} */
export const sfx = {
  clap(rig, t) {
    for (const dt of [0, 0.09]) {
      burst(rig, t + dt, 'bandpass', 2200, 6, 1.4, 0.04, { reverb: 0.35 })
      blip(rig, t + dt, 1800, 0.25, 0.04, { reverb: 0.3 })
    }
  },
  pop2(rig, t) {
    const o = rig.ctx.createOscillator()
    o.frequency.value = 1000
    const g = rig.ctx.createGain()
    g.gain.setValueAtTime(0.25, t)
    g.gain.setValueAtTime(0, t + 0.042)
    o.connect(g)
    route(rig, g, 'sfx')
    play(rig, o, t, t + 0.05)
  },
  whoosh(rig, t) {
    sweep(rig, t, { from: 300, peak: 1500, back: 300, dur: 0.35, gain: 0.7 })
  },
  longWhoosh(rig, t) {
    sweep(rig, t, { from: 250, peak: 1800, back: 200, dur: 0.9, gain: 0.8 })
  },
  land(rig, t) {
    big(rig, t, { gain: 0.55 })
    burst(rig, t, 'lowpass', 400, 0.7, 0.6, 0.08)
  },
  thunk(rig, t) {
    blip(rig, t, 180, 0.7, 0.06)
    burst(rig, t, 'lowpass', 1200, 0.7, 0.5, 0.03)
  },
  draw(rig, t) {
    const { ctx } = rig
    const n = noise(rig, 'white', true)
    const hp = filter(ctx, 'highpass', 3000)
    const bp = filter(ctx, 'bandpass', 4000, 2)
    bp.frequency.setValueAtTime(4000, t)
    bp.frequency.exponentialRampToValueAtTime(9000, t + 0.5)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(0.5, t + 0.48)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.56)
    n.connect(hp).connect(bp).connect(env)
    route(rig, env, 'sfx', 0.3)
    play(rig, n, t, t + 0.6)
    for (const f of [2900, 4300, 6100]) {
      const o = blip(rig, t + 0.5, f * (1 + rand(-0.004, 0.004)), 0.07, 1.2, { reverb: 0.5 })
      o.detune.value = rand(-6, 6)
    }
  },
  thunder(rig, t) {
    const { ctx } = rig
    burst(rig, t, 'highpass', 1500, 0.7, 0.9, 0.05)
    const n = noise(rig, 'brown', true)
    const lp = filter(ctx, 'lowpass', 400, 0.5)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    let at = t + 0.05
    while (at < t + 3) {
      env.gain.linearRampToValueAtTime(rand(0.4, 1.6) * (1 - (at - t) / 3.2), at)
      at += rand(0.08, 0.3)
    }
    env.gain.linearRampToValueAtTime(0.0001, t + 3.1)
    n.connect(lp).connect(env)
    route(rig, env, 'sfx', 0.4)
    play(rig, n, t, t + 3.2)
  },
  slash(rig, t) {
    sweep(rig, t, { from: 600, to: 3000, dur: 0.12, gain: 1, pan: false })
    blip(rig, t, 60, 0.8, 0.15)
    big(rig, t + 0.04, { gain: 1 })
  },
  stamp(rig, t) {
    blip(rig, t, 90, 0.8, 0.12)
    burst(rig, t, 'lowpass', 800, 0.7, 0.5, 0.03)
  },
  tick(rig, t) {
    blip(rig, t, 3200, 0.05, 0.15)
    blip(rig, t, 4700, 0.04, 0.15)
  },
  paper(rig, t) {
    const { ctx } = rig
    const n = noise(rig, 'white', true)
    const bp = filter(ctx, 'bandpass', 3000, 0.7)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, t)
    let at = t + 0.02
    while (at < t + 0.6) {
      env.gain.linearRampToValueAtTime(rand(0.02, 0.12), at)
      at += rand(0.015, 0.05)
    }
    env.gain.linearRampToValueAtTime(0.0001, t + 0.65)
    n.connect(bp).connect(env)
    route(rig, env, 'sfx', 0.2)
    play(rig, n, t, t + 0.7)
  },
  rewind(rig, t) {
    sweep(rig, t, { from: 2400, to: 200, dur: 0.8, gain: 0.7, rate: [1.6, 0.3] })
  },
  knock(rig, t) {
    blip(rig, t, 520, 0.06, 0.06, { type: 'triangle', reverb: 0.3 })
    burst(rig, t, 'bandpass', 1100, 3, 0.08, 0.03)
  },
}
