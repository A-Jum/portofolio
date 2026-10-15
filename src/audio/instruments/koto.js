import { semitone } from '../scales.js'
import { filter, noise, perc, play, route } from './voice.js'

const cache = new Map()

/** Karplus–Strong rendered in JS into an AudioBuffer (cached per pitch). */
function ksBuffer(ctx, freq, dur = 2.5, damp = 0.996) {
  const key = `${freq}`
  if (cache.has(key)) return cache.get(key)
  const sr = ctx.sampleRate
  const n = Math.floor(sr * dur)
  const N = Math.round(sr / freq)
  const buf = ctx.createBuffer(1, n, sr)
  const out = buf.getChannelData(0)
  const ring = new Float32Array(N).map(() => Math.random() * 2 - 1)
  for (let i = 0; i < n; i++) {
    const j = i % N
    out[i] = ring[j]
    ring[j] = damp * 0.5 * (ring[j] + ring[(i + 1) % N])
  }
  cache.set(key, buf)
  return buf
}

export function pluck(rig, t, freq, { gain = 0.3 } = {}) {
  if (!rig.free()) return
  const { ctx } = rig
  const src = ctx.createBufferSource()
  src.buffer = ksBuffer(ctx, freq)
  // Oshide: press the string a semitone up after the attack.
  if (Math.random() < 0.25) {
    src.playbackRate.setValueAtTime(1, t + 0.3)
    src.playbackRate.linearRampToValueAtTime(semitone, t + 0.45)
  }
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(g)
  route(rig, g, 'music', 0.35)
  src.start(t)
  src.stop(t + 2.5)
  rig.track(src)

  const n = noise(rig)
  const bp = filter(ctx, 'bandpass', 3000, 1)
  const env = perc(ctx, t, gain * 0.5, 0.01, 0.001)
  n.connect(bp).connect(env)
  route(rig, env, 'music')
  play(rig, n, t, t + 0.03)
}
