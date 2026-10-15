import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap.js'

/** @type {Lenis|null} */
let lenis = null
let tick = null

/** Create the single Lenis instance and bind it to the GSAP ticker. */
export function startLenis() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  tick = (t) => lenis.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function destroyLenis() {
  if (!lenis) return
  gsap.ticker.remove(tick)
  lenis.destroy()
  lenis = null
}

export const getLenis = () => lenis

/** Lock or unlock page scroll (works with or without Lenis). */
export function lockScroll(locked) {
  document.documentElement.classList.toggle('is-locked', locked)
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

/** Scroll to a target with Lenis when available, otherwise natively. */
export function scrollToTarget(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, ...opts })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (typeof target === 'number') window.scrollTo({ top: target })
  else el?.scrollIntoView()
}
