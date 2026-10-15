import { filter, noise, rand } from './voice.js'

/** Wind bed: brown noise through an LFO-swept bandpass, plus a faint whistle layer. */
export function createWind(rig) {
  const { ctx } = rig
  const level = ctx.createGain()
  level.gain.value = 0
  const gustGain = ctx.createGain()
  gustGain.gain.value = 1
  level.connect(gustGain).connect(rig.bus.ambience)

  const src = noise(rig, 'brown', true)
  const bp = filter(ctx, 'bandpass', 600, 0.9)
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = 300
  lfo.connect(lfoDepth).connect(bp.frequency)
  const body = ctx.createGain()
  body.gain.value = 0.12 * 6 // brown buffer is quiet; level node holds the mix
  src.connect(bp).connect(body).connect(level)

  const ws = noise(rig, 'white', true)
  const wbp = filter(ctx, 'bandpass', 2000, 8)
  const wg = ctx.createGain()
  wg.gain.value = 0.02
  ws.connect(wbp).connect(wg).connect(level)

  src.start()
  ws.start()
  lfo.start()

  return {
    level,
    set(amount, t) {
      level.gain.setTargetAtTime(amount, t, 0.7)
    },
    /** Occasional whistle sweep, called by the scheduler. */
    whistle(t) {
      const f = rand(1500, 3000)
      wbp.frequency.setTargetAtTime(f, t, 1.2)
      return t + rand(3, 7)
    },
    gust(v) {
      const t = ctx.currentTime
      const k = Math.min(1, Math.abs(v))
      gustGain.gain.cancelScheduledValues(t)
      gustGain.gain.setTargetAtTime(1 + k * 1.6, t, 0.08)
      gustGain.gain.setTargetAtTime(1, t + 0.25, 0.45)
      bp.frequency.cancelScheduledValues(t)
      bp.frequency.setTargetAtTime(600 + k * 500, t, 0.08)
      bp.frequency.setTargetAtTime(600, t + 0.25, 0.45)
    },
  }
}
