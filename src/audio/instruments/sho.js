import { SHO_CLUSTER } from '../scales.js'
import { filter } from './voice.js'

/**
 * Shō drone: a tight sawtooth cluster through a lowpass with a slow 6 s swell.
 * Returns a level node (0..1) the engine crossfades per scene, and an extra
 * low drone used in the Arsenal chapter.
 */
export function createSho(rig) {
  const { ctx } = rig
  const level = ctx.createGain()
  level.gain.value = 0
  const swell = ctx.createGain()
  swell.gain.value = 0.02
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 1 / 12
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = 0.02
  lfo.connect(lfoDepth).connect(swell.gain)

  const lp = filter(ctx, 'lowpass', 1200, 0.3)
  lp.connect(swell).connect(level).connect(rig.bus.music)
  const oscs = SHO_CLUSTER.map((f, i) => {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f
    o.detune.value = (i % 2 ? 1 : -1) * 4
    const g = ctx.createGain()
    g.gain.value = 0.2
    o.connect(g).connect(lp)
    return o
  })

  // Low drone: D2 + A2 sines, barely there.
  const droneLevel = ctx.createGain()
  droneLevel.gain.value = 0
  const droneLp = filter(ctx, 'lowpass', 400, 0.2)
  droneLp.connect(droneLevel).connect(rig.bus.music)
  const drones = [73.42, 110].map((f) => {
    const o = ctx.createOscillator()
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = 0.05
    o.connect(g).connect(droneLp)
    return o
  })

  const all = [lfo, ...oscs, ...drones]
  all.forEach((o) => o.start())

  return {
    set(on, t) {
      level.gain.setTargetAtTime(on ? 1 : 0, t, 0.7)
    },
    setDrone(on, t) {
      droneLevel.gain.setTargetAtTime(on ? 1 : 0, t, 0.7)
    },
  }
}
