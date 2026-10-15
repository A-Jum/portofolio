import { createNoiseBuffers } from './noise.js'
import { createReverb } from './reverb.js'
import { createScheduler } from './scheduler.js'
import { HIRAJOSHI_D } from './scales.js'
import { don, ka } from './instruments/taiko.js'
import { playPhrase } from './instruments/shakuhachi.js'
import { pluck } from './instruments/koto.js'
import { createSho } from './instruments/sho.js'
import { createWind } from './instruments/wind.js'
import { createRain } from './instruments/rain.js'
import { sfx } from './instruments/sfx.js'
import { pick, rand } from './instruments/voice.js'

/**
 * @typedef {'clap'|'pop2'|'whoosh'|'longWhoosh'|'land'|'thunk'|'draw'|'thunder'|'slash'|'stamp'|'tick'|'paper'|'rewind'|'knock'} SoundEvent
 * @typedef {'prologue'|'creed'|'battles'|'training'|'arsenal'|'epilogue'} Scene
 * @typedef {{ enabled: boolean, muted: boolean }} AudioState
 */

const MAX_VOICES = 24
const MASTER = 0.8

/** Per-scene mix: continuous layer levels plus which scheduled tasks run. */
const SCENES = {
  prologue: { wind: 1, sho: true, drone: false, tasks: ['heartbeat', 'shakuhachi', 'whistle'] },
  creed: { wind: 0.6, sho: false, drone: false, tasks: ['shakuhachiSparse', 'whistle'] },
  battles: { wind: 0.35, sho: false, drone: false, tasks: ['taiko', 'kotoRare'] },
  training: { wind: 0.7, sho: false, drone: false, tasks: ['kotoSlow', 'whistle'] },
  arsenal: { wind: 0.3, sho: false, drone: true, tasks: [] },
  epilogue: { wind: 0.8, sho: true, drone: false, tasks: ['finalPhrase', 'whistle'] },
}

/**
 * Singleton audio engine. Every method is a safe no-op until `enable()` has run
 * inside a user gesture, and while muted.
 */
export function createAudioEngine() {
  /** @type {AudioContext|null} */
  let ctx = null
  let rig = null
  let master, wind, rain, sho, sched
  let enabled = false
  let muted = false
  let intensity = 0
  let scene = /** @type {Scene} */ ('prologue')
  let voices = 0
  const lastPlayed = new Map()
  const listeners = new Set()

  let snapshot = { enabled, muted }
  const emit = () => {
    snapshot = { enabled, muted }
    listeners.forEach((fn) => fn(snapshot))
  }
  const live = () => ctx && enabled && !muted && ctx.state === 'running'

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC({ latencyHint: 'interactive' })
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 4
    comp.attack.value = 0.01
    comp.release.value = 0.25
    comp.connect(ctx.destination)

    master = ctx.createGain()
    master.gain.value = 0
    master.connect(comp)

    const bus = {}
    for (const [name, g] of [['music', 0.45], ['ambience', 0.35], ['sfx', 0.7]]) {
      bus[name] = ctx.createGain()
      bus[name].gain.value = g
      bus[name].connect(master)
    }
    const reverbSend = ctx.createGain()
    const reverbReturn = ctx.createGain()
    reverbReturn.gain.value = 0.35
    reverbSend.connect(createReverb(ctx)).connect(reverbReturn).connect(master)

    rig = {
      ctx,
      noise: createNoiseBuffers(ctx),
      bus,
      reverbSend,
      free: () => voices < MAX_VOICES,
      track(src) {
        voices++
        src.addEventListener('ended', () => voices--, { once: true })
      },
    }

    wind = createWind(rig)
    rain = createRain(rig)
    sho = createSho(rig)
    sched = createScheduler(ctx)
    sched.start()

    document.addEventListener('visibilitychange', () => {
      if (!ctx) return
      if (document.hidden) ctx.suspend()
      else if (enabled && !muted) ctx.resume()
    })
  }

  /** Scheduled musical tasks; each returns the time of its next call. */
  const TASKS = {
    heartbeat: (t) => {
      const bpm = 50 + 40 * intensity
      const g = 0.25 + 0.45 * intensity
      don(rig, t, { gain: g, decay: 0.9, reverb: 0.2 })
      don(rig, t + 0.24, { gain: g * 0.6, decay: 0.7, reverb: 0.2 })
      return t + 60 / bpm
    },
    shakuhachi: (t) => playPhrase(rig, t) + rand(4, 10),
    shakuhachiSparse: (t) => playPhrase(rig, t) + rand(9, 16),
    finalPhrase: (t) => {
      playPhrase(rig, t, { endOnD: true })
      return null
    },
    whistle: (t) => wind.whistle(t),
    taiko: (() => {
      // 72 bpm in eighths, mostly rests: D = don, k = ka.
      const pattern = 'D--kD-D---k-Dk--'
      let step = 0
      return (t) => {
        const c = pattern[step % pattern.length]
        if (c === 'D') don(rig, t, { gain: 0.55, decay: 1 })
        if (c === 'k') ka(rig, t, { gain: 0.3 })
        step++
        return t + 60 / 72 / 2
      }
    })(),
    kotoRare: (t) => {
      if (Math.random() < 0.5) pluck(rig, t, pick(HIRAJOSHI_D), { gain: 0.22 })
      return t + rand(3, 7)
    },
    kotoSlow: (() => {
      let i = 2
      return (t) => {
        i = Math.max(0, Math.min(HIRAJOSHI_D.length - 1, i + pick([-1, -1, 1, 1, 2, -2])))
        pluck(rig, t, HIRAJOSHI_D[i], { gain: 0.26 })
        return t + rand(1.6, 3.5)
      }
    })(),
  }

  function applyScene(name, fade = true) {
    if (!ctx) return
    const cfg = SCENES[name] || SCENES.prologue
    const t = ctx.currentTime
    wind.set(cfg.wind * (name === 'prologue' ? 0.6 + 0.4 * intensity : 1), t)
    sho.set(cfg.sho, t)
    sho.setDrone(cfg.drone, t)
    if (name !== 'prologue') rain.set(0, t)
    else rain.set(rainLevel(), t)
    for (const key of Object.keys(TASKS)) {
      const want = cfg.tasks.includes(key)
      if (!want) sched.remove(key)
      else if (!sched.has(key)) sched.add(key, TASKS[key], fade ? rand(0.8, 2) : 0.3)
    }
  }

  const rainLevel = () => Math.max(0, Math.min(1, (intensity - 0.48) / 0.3)) * 0.25

  return {
    /** Create or resume the AudioContext. Must be called from a user gesture handler. */
    async enable() {
      try {
        if (navigator.audioSession) navigator.audioSession.type = 'playback'
      } catch {
        /* not supported */
      }
      if (!ctx) build()
      await ctx.resume()
      enabled = true
      muted = false
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(MASTER, t + 2.5)
      applyScene(scene, false)
      emit()
    },

    /** @param {boolean} value */
    setMuted(value) {
      muted = !!value
      emit()
      if (!ctx || !enabled) return
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      if (muted) {
        master.gain.linearRampToValueAtTime(0, t + 0.4)
        setTimeout(() => muted && ctx.suspend(), 450)
      } else {
        ctx.resume().then(() => {
          const t2 = ctx.currentTime
          master.gain.setTargetAtTime(MASTER, t2, 0.3)
          applyScene(scene)
        })
      }
    },

    /** @param {number} x hero progress 0..1 */
    setIntensity(x) {
      intensity = Math.max(0, Math.min(1, x))
      if (!live() || scene !== 'prologue') return
      const t = ctx.currentTime
      rain.set(rainLevel(), t)
      wind.set(0.6 + 0.4 * intensity, t)
    },

    /** @param {number} velocity scroll velocity, roughly -1..1 */
    gust(velocity) {
      if (live()) wind.gust(velocity)
    },

    /** @param {Scene} name */
    setScene(name) {
      if (name === scene) return
      scene = name
      if (live()) applyScene(name)
    },

    /** @param {SoundEvent} event */
    play(event) {
      if (!live() || !sfx[event]) return
      const now = performance.now()
      if (now - (lastPlayed.get(event) || 0) < 60) return
      lastPlayed.set(event, now)
      sfx[event](rig, ctx.currentTime + 0.005)
    },

    /** @returns {AudioState} */
    getState: () => snapshot,

    /** @param {(s: AudioState) => void} fn */
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}

export const audio = createAudioEngine()
