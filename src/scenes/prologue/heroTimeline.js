import { gsap, ScrollTrigger } from '../../lib/gsap.js'
import { clamp, lerp } from '../../lib/rng.js'
import { NINJA_POSES, RONIN_POSES, poseAt, setPose } from '../../characters/poses.js'
import { GROVE, NINJA_BOX, RONIN_BOX } from './layout.js'

/** Subtitle lines keyed by progress windows. */
export const SUBTITLES = [
  [0.02, 0.14, 'Bandung. The age of machines that learn.'],
  [0.17, 0.31, 'In the shadows, problems move fast.'],
  [0.49, 0.61, 'A blade is only as sharp as the mind behind it.'],
  [0.93, 1.01, 'Chapter one.'],
]

const RONIN_KEYS = [
  [0, 'idle'], [0.48, 'idle'], [0.51, 'grip'], [0.535, 'grip'], [0.57, 'draw'],
  [0.67, 'draw'], [0.69, 'dash'], [0.745, 'dash'], [0.765, 'afterCut'], [1, 'afterCut'],
]

const NINJA_KEYS = [
  [0, 'crouch'], [0.17, 'crouch'], [0.18, 'leap'], [0.208, 'leap'], [0.218, 'land'],
  [0.23, 'run', { cycles: 3 }], [0.31, 'stand'], [0.335, 'stand'], [0.341, 'windup'], [0.347, 'throw'],
  [0.353, 'windup'], [0.36, 'throw'], [0.367, 'windup'], [0.374, 'throw'], [0.4, 'land'],
  [0.62, 'land'], [0.63, 'leap'], [0.658, 'leap'], [0.67, 'land'], [0.69, 'land'], [0.7, 'dash'],
  [0.745, 'dash'], [0.76, 'land'], [1, 'land'],
]

/** Shuriken: [release progress, flight length]. */
export const THROWS = [[0.347, 0.03], [0.36, 0.03], [0.374, 0.03]]

/** Untransformed centre of `el` relative to `root`, walking the offsetParent chain. */
function offsetIn(el, root) {
  let x = el.offsetWidth / 2
  let y = el.offsetHeight / 2
  let n = el
  while (n && n !== root) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent
  }
  return { x, y }
}

const smooth = (t) => t * t * (3 - 2 * t)
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1)

/** Where the ninja is at progress p, in screen px (feet), plus scale and opacity. */
export function ninjaAt(p, L) {
  const hide = L.g2s(GROVE.hideX, GROVE.hideY)
  const roofA = L.g2s(GROVE.ridgeFrom, GROVE.ridgeY)
  const roofB = L.g2s(GROVE.ridgeTo, GROVE.ridgeY)
  const ground = { x: L.vw * (L.portrait ? 0.78 : 0.64), y: L.ground }
  const dashEnd = { x: L.vw * (L.portrait ? 0.1 : 0.07), y: L.ground }
  const big = (L.ronin.h * 0.9) / L.ninja.h
  const arc = L.vh * 0.2

  if (p < 0.17) return { ...hide, scale: 1, opacity: seg(p, 0.15, 0.168) }
  if (p < 0.215) {
    const t = seg(p, 0.17, 0.215)
    return { x: lerp(hide.x, roofA.x, t), y: lerp(hide.y, roofA.y, smooth(t)) - arc * 4 * t * (1 - t), scale: 1, opacity: 1 }
  }
  if (p < 0.23) return { ...roofA, scale: 1, opacity: 1 }
  if (p < 0.31) return { x: lerp(roofA.x, roofB.x, seg(p, 0.23, 0.31)), y: roofA.y, scale: 1, opacity: 1 }
  if (p < 0.62) return { ...roofB, scale: 1, opacity: 1 }
  if (p < 0.665) {
    const t = seg(p, 0.62, 0.665)
    return {
      x: lerp(roofB.x, ground.x, t),
      y: lerp(roofB.y, ground.y, t * t) - arc * 0.8 * 4 * t * (1 - t),
      scale: lerp(1, big, smooth(t)),
      opacity: 1,
    }
  }
  if (p < 0.69) return { ...ground, scale: big, opacity: 1 }
  if (p < 0.785) {
    const t = smooth(seg(p, 0.69, 0.745))
    return { x: lerp(ground.x, dashEnd.x, t), y: ground.y, scale: big, opacity: 1 }
  }
  return { ...dashEnd, scale: big, opacity: 0 }
}

export function roninX(p, L) {
  const t = smooth(seg(p, 0.69, 0.745))
  return L.ronin.x + t * L.vw * (L.portrait ? 0.14 : 0.22)
}

/** Places a character wrapper so its feet sit at (x, y). */
export function placeChar(el, box, h, x, y, scale = 1, opacity = 1) {
  const w = (h * box.w) / box.h
  const fx = (box.footX / box.w) * w
  gsap.set(el, { x: x - fx, y: y - h, scale, opacity, transformOrigin: `${fx}px ${h}px` })
}

/**
 * Builds the pinned, scrubbed master timeline.
 * @param {object} o
 */
export function buildHeroTimeline(o) {
  const { els, rigs, particles, audio, setSubtitle, getLayout, motion, mobile } = o
  let L = getLayout()
  let prev = 0
  let lastSub = null
  const fired = new Map()
  let lastFlash = -1e9
  let lastGust = 0

  const cues = [
    [0.172, () => audio.play('whoosh')],
    [0.215, () => audio.play('land')],
    ...THROWS.map(([p, d]) => [p + d, () => audio.play('thunk')]),
    [0.54, () => audio.play('draw')],
    [0.62, () => {
      audio.play('thunder')
      const now = performance.now()
      if (now - lastFlash > 2500) {
        lastFlash = now
        gsap.fromTo(els.flash, { opacity: 0.7 }, { opacity: 0, duration: 0.25, ease: 'power1.out' })
      }
    }],
    [0.69, () => audio.play('longWhoosh')],
    [0.785, () => {
      const n = ninjaAt(0.78, L)
      particles?.puff(n.x, n.y - L.ninja.h * n.scale * 0.35, n.scale * (L.mobile ? 0.6 : 0.9))
    }],
    [0.83, () => audio.play('slash')],
  ]

  function update(p) {
    // Characters.
    setPose(rigs.ronin, poseAt(RONIN_KEYS, RONIN_POSES, p))
    setPose(rigs.ninja, poseAt(NINJA_KEYS, NINJA_POSES, p))
    const drawn = p >= 0.535
    gsap.set(els.held, { opacity: drawn ? 1 : 0 })
    gsap.set(els.sheathed, { opacity: drawn ? 0 : 1 })
    placeChar(els.roninWrap, RONIN_BOX, L.ronin.h, roninX(p, L), L.ronin.y)
    const n = ninjaAt(p, L)
    placeChar(els.ninjaWrap, NINJA_BOX, L.ninja.h, n.x, n.y, n.scale, n.opacity)

    const running = (p > 0.17 && p < 0.31) || (p > 0.62 && p < 0.76)
    motion.ninjaAmp = running ? 1.7 : 0.6
    motion.roninAmp = p > 0.69 && p < 0.77 ? 3 : p > 0.48 ? 1.6 : 1

    // Crows scatter as the ninja leaps.
    els.crows.forEach((c, i) => {
      const t = seg(p, 0.16 + i * 0.008, 0.34 + i * 0.008)
      const start = L.g2s(640 + i * 34, 180 + (i % 3) * 60)
      const visible = t > 0 && t < 1
      gsap.set(c, {
        x: start.x - t * (L.vw * 0.55 + i * 30),
        y: start.y - t * (L.vh * 0.35 + i * 20) + Math.sin(t * 9 + i) * 12,
        opacity: visible ? 1 : 0,
        scale: 0.8 + t * 0.6,
      })
    })

    els.hint.style.visibility = p > 0.015 ? 'hidden' : ''

    // Weather and sound.
    particles?.setRain(seg(p, 0.48, 0.62) * 0.85 + seg(p, 0.62, 0.8) * 0.15)
    particles?.setSwirl(seg(p, 0.9, 1))
    audio.setIntensity(p)

    // Subtitles.
    const sub = SUBTITLES.find(([a, b]) => p >= a && p < b)
    const text = sub ? sub[2] : null
    if (text !== lastSub) {
      lastSub = text
      setSubtitle(text)
    }

    // Cues fire only when crossed forward, never twice within a second, and not on big jumps.
    if (p > prev && p - prev < 0.12) {
      const now = performance.now()
      for (const [at, fn] of cues) {
        if (prev < at && p >= at && now - (fired.get(at) || 0) > 1000) {
          fired.set(at, now)
          fn()
        }
      }
    }
    prev = p
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate() {
      update(this.progress())
    },
    scrollTrigger: {
      trigger: els.section,
      start: 'top top',
      end: mobile ? '+=220%' : '+=350%',
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        L = getLayout()
      },
      onUpdate: (self) => {
        const v = self.getVelocity() / 2500
        particles?.setWind(v)
        const now = performance.now()
        if (now - lastGust > 140 && Math.abs(v) > 0.15) {
          lastGust = now
          audio.gust(v)
        }
      },
    },
  })

  // 0.00–0.15 dolly-in, parallax and title dissolve.
  tl.fromTo(els.camera, { scale: 1 }, { scale: 1.12, duration: 0.15 }, 0)
  tl.to(els.camera, { scale: 1.16, duration: 0.85 }, 0.15)
  els.layers.forEach(({ el, depth }) => {
    tl.fromTo(el, { x: 0, y: 0 }, { x: () => -depth * L.vw * 0.025, y: () => -depth * L.fh * 0.1, duration: 1 }, 0)
  })
  if (els.chars?.length) {
    tl.to(els.chars, { opacity: 0, y: -36, filter: 'blur(6px)', duration: 0.06, stagger: 0.004 }, 0.02)
  }
  tl.to(els.kanji, { opacity: 0, y: -24, duration: 0.06 }, 0.05)
  tl.to(els.role, { opacity: 0, y: -12, duration: 0.05 }, 0.04)

  // 0.32–0.48 shuriken fly at the camera and stick around the role line, which returns larger.
  els.shuriken.forEach((s, i) => {
    const [at, d] = THROWS[i]
    tl.fromTo(
      s,
      {
        x: () => ninjaAt(0.35, L).x - offsetIn(s, els.frame).x,
        y: () => ninjaAt(0.35, L).y - L.ninja.h * 0.75 - L.fh * 0.035 - offsetIn(s, els.frame).y,
        scale: 0.12,
        rotation: 0,
        opacity: 0,
      },
      { x: 0, y: 0, scale: 1, rotation: 900 + i * 90, opacity: 1, duration: d, ease: 'power2.in', immediateRender: true },
      at,
    )
    tl.to(s, { rotation: `+=${i % 2 ? 7 : -7}`, duration: 0.006, repeat: 3, yoyo: true }, at + d)
  })
  tl.fromTo(els.role, { opacity: 0, scale: 0.92, y: 0 }, { opacity: 1, scale: 1.25, y: 0, duration: 0.06, immediateRender: false }, 0.39)

  tl.to([els.role, ...els.shuriken], { opacity: 0, duration: 0.03 }, 0.6)

  // 0.48–0.62 draw, gleam, rain and rising mist.
  tl.fromTo(els.gleam, { attr: { y: 200 } }, { attr: { y: 470 }, duration: 0.03 }, 0.575)
  tl.fromTo(els.mist, { opacity: 0.55, y: 0 }, { opacity: 1, y: () => -L.fh * 0.08, duration: 0.14 }, 0.48)

  // 0.62–0.82 dash with speed lines.
  tl.fromTo(els.speed, { opacity: 0, x: 0 }, { opacity: 0.9, x: () => -L.vw * 0.05, duration: 0.012 }, 0.69)
  tl.to(els.speed, { opacity: 0, x: () => -L.vw * 0.12, duration: 0.03 }, 0.73)

  // 0.82–0.92 the cut is drawn.
  tl.fromTo(els.slash, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.07, ease: 'power3.in' }, 0.82)
  tl.fromTo(els.slashWrap, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.82)

  // 0.92–1.00 the frame splits along the cut and the letterbox withdraws.
  const gap = { g: 0 }
  const T = 62
  const B = 38
  tl.to(
    gap,
    {
      g: 70,
      duration: 0.08,
      ease: 'power2.in',
      onUpdate: () => {
        const g = gap.g
        els.frame.style.clipPath =
          g <= 0.01
            ? ''
            : `polygon(0% 0%, ${T - g}% 0%, ${B - g}% 100%, ${B + g}% 100%, ${T + g}% 0%, 100% 0%, 100% 100%, 0% 100%)`
      },
    },
    0.92,
  )
  tl.fromTo(els.frame, { scale: 1 }, { scale: 1.04, duration: 0.08 }, 0.92)
  tl.to(els.slashWrap, { opacity: 0, duration: 0.03 }, 0.95)
  tl.to(els.lbTop, { yPercent: -100, duration: 0.06 }, 0.93)
  tl.to(els.lbBottom, { yPercent: 100, duration: 0.06 }, 0.93)
  tl.set({}, {}, 1)

  update(0)

  return {
    tl,
    refresh: () => {
      L = getLayout()
      update(tl.progress())
    },
    kill() {
      tl.scrollTrigger?.kill()
      tl.kill()
      els.frame.style.clipPath = ''
    },
  }
}

/** Reduced motion: one still composition around progress 0.55 (blade drawn, ninja on the roof). */
export function staticFrame({ els, rigs, particles, getLayout }) {
  const L = getLayout()
  setPose(rigs.ronin, RONIN_POSES.draw)
  setPose(rigs.ninja, NINJA_POSES.land)
  gsap.set(els.held, { opacity: 1 })
  gsap.set(els.sheathed, { opacity: 0 })
  placeChar(els.roninWrap, RONIN_BOX, L.ronin.h, L.ronin.x, L.ronin.y)
  const n = ninjaAt(0.5, L)
  placeChar(els.ninjaWrap, NINJA_BOX, L.ninja.h, n.x, n.y, 1, 1)
  els.crows.forEach((c) => gsap.set(c, { opacity: 0 }))
  particles?.setRain(0.35)
  particles?.drawOnce()
}

export { ScrollTrigger }
