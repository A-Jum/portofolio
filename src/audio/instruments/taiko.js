import { filter, noise, perc, play, route } from './voice.js'

/** Don: centre stroke. Sine 110 → 48 Hz, 1.2 s decay, plus a skin slap. */
export function don(rig, t, { gain = 1, f0 = 110, f1 = 48, decay = 1.2, bus = 'music', reverb = 0.3 } = {}) {
  if (!rig.free()) return
  const { ctx } = rig
  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(f1, t + 0.35)
  const env = perc(ctx, t, gain, decay)
  osc.connect(env)
  route(rig, env, bus, reverb)
  play(rig, osc, t, t + decay + 0.05)

  const slap = noise(rig)
  const bp = filter(ctx, 'bandpass', 900, 1.2)
  const senv = perc(ctx, t, 0.4 * gain, 0.08)
  slap.connect(bp).connect(senv)
  route(rig, senv, bus, reverb)
  play(rig, slap, t, t + 0.1)
}

/** Ka: rim stroke. Short high-passed noise and a 1.4 kHz blip. */
export function ka(rig, t, { gain = 0.5, bus = 'music' } = {}) {
  if (!rig.free()) return
  const { ctx } = rig
  const n = noise(rig)
  const hp = filter(ctx, 'highpass', 2500)
  const env = perc(ctx, t, gain, 0.03, 0.001)
  n.connect(hp).connect(env)
  route(rig, env, bus, 0.2)
  play(rig, n, t, t + 0.05)

  const osc = ctx.createOscillator()
  osc.frequency.value = 1400
  const oenv = perc(ctx, t, gain * 0.35, 0.04, 0.001)
  osc.connect(oenv)
  route(rig, oenv, bus, 0.1)
  play(rig, osc, t, t + 0.06)
}

/** Big drum for slash and landings: 80 Hz don, 2 s decay, plus 45 Hz sub. */
export function big(rig, t, { gain = 1, bus = 'sfx' } = {}) {
  don(rig, t, { gain, f0: 80, f1: 42, decay: 2, bus, reverb: 0.4 })
  if (!rig.free()) return
  const sub = rig.ctx.createOscillator()
  sub.frequency.value = 45
  const env = perc(rig.ctx, t, gain * 0.7, 1.6, 0.01)
  sub.connect(env)
  route(rig, env, bus)
  play(rig, sub, t, t + 1.7)
}
