import { filter, noise } from './voice.js'

/** Rain: white noise band-limited to 1.2–7 kHz; level follows the hero timeline. */
export function createRain(rig) {
  const { ctx } = rig
  const level = ctx.createGain()
  level.gain.value = 0
  const src = noise(rig, 'white', true)
  src.connect(filter(ctx, 'highpass', 1200, 0.5)).connect(filter(ctx, 'lowpass', 7000, 0.5)).connect(level)
  level.connect(rig.bus.ambience)
  src.start()
  return {
    set(amount, t) {
      level.gain.setTargetAtTime(Math.max(0, Math.min(0.25, amount)), t, 0.3)
    },
  }
}
