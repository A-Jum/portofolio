/**
 * Small helpers shared by instruments.
 * @typedef {Object} Rig
 * @property {AudioContext} ctx
 * @property {{ white: AudioBuffer, brown: AudioBuffer }} noise
 * @property {{ music: GainNode, ambience: GainNode, sfx: GainNode }} bus
 * @property {GainNode} reverbSend
 * @property {(src: AudioScheduledSourceNode) => void} track   Count a voice until it ends
 * @property {() => boolean} free                             False when polyphony is exhausted
 */

/** Noise buffer source starting at a random offset. */
export function noise(rig, type = 'white', loop = false) {
  const src = rig.ctx.createBufferSource()
  src.buffer = rig.noise[type]
  src.loop = loop
  return src
}

export function filter(ctx, type, freq, Q = 1) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = Q
  return f
}

/** Percussive envelope: tiny attack, exponential decay to silence. */
export function perc(ctx, t, peak, decay, attack = 0.002) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  return g
}

/** Connect `node` to a bus and, optionally, a share of it to the reverb. */
export function route(rig, node, busName, reverb = 0) {
  node.connect(rig.bus[busName])
  if (reverb > 0) {
    const s = rig.ctx.createGain()
    s.gain.value = reverb
    node.connect(s)
    s.connect(rig.reverbSend)
  }
}

/** Start and stop a source, counting it towards polyphony. */
export function play(rig, src, t, stop) {
  src.start(t, src.buffer ? Math.random() * 0.5 : undefined)
  src.stop(stop)
  rig.track(src)
}

export const rand = (a, b) => a + Math.random() * (b - a)
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
