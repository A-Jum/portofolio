import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from './lib/gsap.js'
import { destroyLenis, getLenis, lockScroll, scrollToTarget, startLenis } from './lib/lenis.js'
import { audio } from './audio/AudioEngine.js'
import { chapters } from './data/profile.js'
import { useReducedMotion } from './hooks/useReducedMotion.js'
import { useIsMobile } from './hooks/useIsMobile.js'
import Loader from './components/Loader.jsx'
import SoundGate from './components/SoundGate.jsx'
import FilmLeader from './components/FilmLeader.jsx'
import FilmOverlay from './components/FilmOverlay.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import ChapterNav from './components/ChapterNav.jsx'
import KatanaProgress from './components/KatanaProgress.jsx'
import Cursor from './components/Cursor.jsx'
import HeroScene from './scenes/prologue/HeroScene.jsx'
import Creed from './scenes/Creed.jsx'
import Battles from './scenes/Battles.jsx'
import Training from './scenes/Training.jsx'
import Arsenal from './scenes/Arsenal.jsx'
import Epilogue from './scenes/Epilogue.jsx'

const LOADER_MAX = 2500
const LOADER_MIN = 900

/** Which chapter owns the upper quarter of the viewport. */
function useActiveChapter() {
  const [active, setActive] = useState('prologue')
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const line = window.innerHeight * 0.25
      let current = 'prologue'
      for (const c of chapters) {
        if (c.id === 'prologue') continue
        const el = document.getElementById(c.id)
        if (el && el.getBoundingClientRect().top <= line) current = c.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return active
}

export default function App() {
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const [phase, setPhase] = useState('loading') // loading → gate → leader → film
  const [progress, setProgress] = useState(0)
  const [leavingLoader, setLeavingLoader] = useState(false)
  const [rewinding, setRewinding] = useState(false)
  const [burn, setBurn] = useState(0)
  const [fineCursor] = useState(() => window.matchMedia('(pointer: fine)').matches)
  const heroReady = useRef(false)
  const fontsReady = useRef(false)
  const active = useActiveChapter()
  const mainRef = useRef(null)

  // Always start at the top; the film begins at frame one.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  // Smooth scroll (skipped for reduced motion), locked until the visitor chooses.
  useEffect(() => {
    if (!reduced) startLenis()
    lockScroll(true)
    return () => destroyLenis()
  }, [reduced])

  // Loader progress: fonts + first hero frame, capped at 2.5 s.
  useEffect(() => {
    const t0 = performance.now()
    let raf
    const tick = () => {
      const elapsed = performance.now() - t0
      const real = (fontsReady.current ? 0.5 : 0) + (heroReady.current ? 0.5 : 0)
      const timeShare = Math.min(1, elapsed / LOADER_MAX)
      const p = Math.max(real * Math.min(1, elapsed / LOADER_MIN), timeShare)
      setProgress(p)
      if (p >= 1 || elapsed >= LOADER_MAX) {
        setProgress(1)
        setLeavingLoader(true)
        setTimeout(() => setPhase('gate'), reduced ? 150 : 500)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    document.fonts?.ready.then(() => {
      fontsReady.current = true
      ScrollTrigger.refresh()
    })
    if (!document.fonts) fontsReady.current = true
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const onHeroReady = useCallback(() => {
    heroReady.current = true
  }, [])

  const onGateDone = useCallback(() => {
    setPhase(reduced ? 'film' : 'leader')
  }, [reduced])

  const onLeaderDone = useCallback(() => setPhase('film'), [])

  // Film starts: unlock scroll once the opening has played.
  useEffect(() => {
    if (phase !== 'film') return
    const t = setTimeout(() => {
      lockScroll(false)
      ScrollTrigger.refresh()
    }, reduced ? 0 : 2600)
    return () => clearTimeout(t)
  }, [phase, reduced])

  // Chapter changes drive the music scene and the reel-change burn.
  const prevActive = useRef(active)
  useEffect(() => {
    const c = chapters.find((ch) => ch.id === active)
    if (c) audio.setScene(c.scene)
    if (prevActive.current !== active) {
      prevActive.current = active
      setBurn((b) => b + 1)
    }
  }, [active])

  const onRewind = useCallback(() => {
    if (reduced) {
      scrollToTarget(0)
      document.getElementById('prologue')?.focus?.()
      return
    }
    audio.play('rewind')
    setRewinding(true)
    const lenis = getLenis()
    const done = () => setRewinding(false)
    if (lenis) lenis.scrollTo(0, { duration: 2.4, easing: (t) => 1 - Math.pow(1 - t, 3), onComplete: done })
    else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(done, 1500)
    }
    setTimeout(done, 3000)
  }, [reduced])

  const blocking = phase !== 'film'

  return (
    <>
      <a className="skip-link" href="#creed">
        Skip to content
      </a>
      <main ref={mainRef} inert={blocking ? true : undefined} className={reduced ? 'is-reduced' : 'is-motion'}>
        <HeroScene reduced={reduced} mobile={mobile} started={phase === 'film'} onReady={onHeroReady} />
        <Creed reduced={reduced} />
        <Battles reduced={reduced} mobile={mobile} />
        <Training reduced={reduced} />
        <Arsenal reduced={reduced} />
        <Epilogue reduced={reduced} onRewind={onRewind} />
      </main>

      <div inert={blocking ? true : undefined}>
        <ChapterNav active={active} />
        <KatanaProgress />
        <SoundToggle />
      </div>
      <FilmOverlay hero={active === 'prologue'} reduced={reduced} rewinding={rewinding} burn={burn} />
      {fineCursor && !reduced && <Cursor />}

      {phase === 'loading' && <Loader progress={progress} leaving={leavingLoader} />}
      {phase === 'gate' && <SoundGate reduced={reduced} onDone={onGateDone} />}
      {phase === 'leader' && <FilmLeader onDone={onLeaderDone} />}
    </>
  )
}
