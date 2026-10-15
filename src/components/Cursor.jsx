import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap.js'
import Shuriken from './Shuriken.jsx'

/** Shuriken cursor (fine pointers only, motion allowed). Spins with pointer speed. */
export default function Cursor() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const qx = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3.out' })
    let last = { x: 0, y: 0, t: performance.now() }
    let rot = 0
    let spin = 0
    const onMove = (e) => {
      const now = performance.now()
      const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y)
      spin = Math.min(40, spin + dist * 0.5)
      last = { x: e.clientX, y: e.clientY, t: now }
      qx(e.clientX)
      qy(e.clientY)
      el.classList.add('is-visible')
      const hot = e.target.closest?.('a, button, [role="button"], .rack__tier')
      el.classList.toggle('is-hot', !!hot)
    }
    const tick = () => {
      spin *= 0.92
      rot = (rot + spin + 0.4) % 360
      el.firstChild.style.transform = `rotate(${rot}deg)`
    }
    const onLeave = () => el.classList.remove('is-visible')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    gsap.ticker.add(tick)
    document.documentElement.classList.add('has-cursor')
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      gsap.ticker.remove(tick)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <div className="cursor__spin">
        <Shuriken size={22} />
      </div>
    </div>
  )
}
