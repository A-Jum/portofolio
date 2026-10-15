import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, SplitText } from '../../lib/gsap.js'
import { audio } from '../../audio/AudioEngine.js'
import { profile } from '../../data/profile.js'
import { ParticleField } from '../../canvas/ParticleField.js'
import { Mist } from '../../canvas/Mist.js'
import Ronin from '../../characters/Ronin.jsx'
import Ninja from '../../characters/Ninja.jsx'
import Crow from '../../characters/Crow.jsx'
import { buildRig, NINJA_PIVOTS, RONIN_PIVOTS } from '../../characters/poses.js'
import { hemPath, ribbonPath } from '../../characters/fabric.js'
import Subtitle from '../../components/Subtitle.jsx'
import Shuriken from '../../components/Shuriken.jsx'
import Sky from './layers/Sky.jsx'
import Moon from './layers/Moon.jsx'
import Mountains from './layers/Mountains.jsx'
import Castle from './layers/Castle.jsx'
import Grove from './layers/Grove.jsx'
import Foreground from './layers/Foreground.jsx'
import { heroLayout } from './layout.js'
import { buildHeroTimeline, staticFrame } from './heroTimeline.js'
import { isTouch } from '../../hooks/useIsMobile.js'

const DEPTHS = { sky: 0.05, moon: 0.1, video: 0.1, mountains: 0.25, castle: 0.4, mist: 0.5, hill: 0.6, grove: 0.7, ninja: 0.7, particles: 0.9, fore: 1.2 }

/** Optional owner-provided atmosphere clip (public/media/hero.webm|mp4). */
function useHeroVideo(enabled) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    ;(async () => {
      for (const url of ['media/hero.webm', 'media/hero.mp4'].map((f) => import.meta.env.BASE_URL + f)) {
        try {
          const res = await fetch(url, { method: 'HEAD' })
          const type = res.headers.get('content-type') || ''
          if (res.ok && type.startsWith('video')) {
            if (alive) setSrc(url)
            return
          }
        } catch {
          /* no clip */
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [enabled])
  return src
}

function Layer({ depth, className = '', children, inner = true }) {
  return (
    <div className={`layer ${className}`} data-depth={depth}>
      {inner ? <div className="layer__in">{children}</div> : children}
    </div>
  )
}

/**
 * 序章 Prologue — the pinned, scroll-scrubbed duel.
 * @param {{ reduced: boolean, mobile: boolean, started: boolean, onReady: () => void }} props
 */
export default function HeroScene({ reduced, mobile, started, onReady }) {
  const sectionRef = useRef(null)
  const frameRef = useRef(null)
  const cameraRef = useRef(null)
  const nameRef = useRef(null)
  const cardRef = useRef(null)
  const roleRef = useRef(null)
  const kanjiRef = useRef(null)
  const kanjiWrapRef = useRef(null)
  const creditRef = useRef(null)
  const hintRef = useRef(null)
  const blackRef = useRef(null)
  const lbTopRef = useRef(null)
  const lbBottomRef = useRef(null)
  const flashRef = useRef(null)
  const slashRef = useRef(null)
  const slashWrapRef = useRef(null)
  const speedRef = useRef(null)
  const mistRef = useRef(null)
  const particlesRef = useRef(null)
  const roninWrapRef = useRef(null)
  const ninjaWrapRef = useRef(null)
  const roninSvgRef = useRef(null)
  const ninjaSvgRef = useRef(null)
  const crowsRef = useRef([])
  const shurikenRef = useRef([])
  const engines = useRef({})
  const readyRef = useRef(onReady)
  const [subtitle, setSubtitle] = useState(null)

  const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData
  const video = useHeroVideo(!mobile && !reduced && !saveData)

  useEffect(() => {
    readyRef.current = onReady
  }, [onReady])

  // Canvases, rigs, layout and the master timeline.
  useLayoutEffect(() => {
    const frame = frameRef.current
    const getLayout = () => heroLayout(window.innerWidth, window.innerHeight)
    const applyLayout = () => {
      const L = getLayout()
      frame.style.setProperty('--lb', `${L.lb}px`)
      frame.style.setProperty('--fh', `${L.fh}px`)
      frame.style.setProperty('--ground', `${L.ground}px`)
      frame.style.setProperty('--grove-left', `${L.groveLeft}px`)
      frame.style.setProperty('--grove-top', `${L.groveTop}px`)
      frame.style.setProperty('--grove-w', `${L.groveW}px`)
      frame.style.setProperty('--ronin-h', `${L.ronin.h}px`)
      frame.style.setProperty('--ninja-h', `${L.ninja.h}px`)
      return L
    }
    applyLayout()

    const tablet = window.innerWidth < 1024
    const particles = new ParticleField(particlesRef.current, { mobile, tablet })
    const mist = new Mist(mistRef.current)
    engines.current = { particles, mist }

    const rigs = {
      ronin: buildRig(roninSvgRef.current, RONIN_PIVOTS),
      ninja: buildRig(ninjaSvgRef.current, NINJA_PIVOTS),
    }
    const svgR = roninSvgRef.current
    const svgN = ninjaSvgRef.current
    const els = {
      section: sectionRef.current,
      frame,
      camera: cameraRef.current,
      layers: [...cameraRef.current.querySelectorAll(':scope > .layer')].map((el) => ({ el, depth: +el.dataset.depth || 0 })),
      hint: hintRef.current,
      kanji: kanjiRef.current,
      role: roleRef.current,
      shuriken: shurikenRef.current,
      gleam: svgR.querySelector('[data-gleam]'),
      held: svgR.querySelector('[data-held]'),
      sheathed: svgR.querySelector('[data-sheathed]'),
      mist: mistRef.current,
      speed: speedRef.current,
      slash: slashWrapRef.current.querySelectorAll('[data-cut]'),
      slashWrap: slashWrapRef.current,
      lbTop: lbTopRef.current,
      lbBottom: lbBottomRef.current,
      flash: flashRef.current,
      roninWrap: roninWrapRef.current,
      ninjaWrap: ninjaWrapRef.current,
      crows: crowsRef.current,
    }

    const motion = { ninjaAmp: 0.6, roninAmp: 1 }
    let split = null
    let hero = null

    if (reduced) {
      staticFrame({ els, rigs, particles, getLayout })
      mist.draw(0)
    } else {
      split = SplitText.create(nameRef.current, { type: 'words,chars', charsClass: 'hero__ch' })
      els.chars = split.chars
      hero = buildHeroTimeline({ els, rigs, particles, audio, setSubtitle, getLayout, motion, mobile })
    }

    // Cloth, ribbons and breathing: one ticker while the hero is on screen.
    const hem = svgR.querySelector('[data-fabric="hem"]')
    const ribA = svgN.querySelector('[data-part="ribbonA"]')
    const ribB = svgN.querySelector('[data-part="ribbonB"]')
    const amp = { r: 1, n: 0.6 }
    const tick = (time) => {
      amp.r += (motion.roninAmp - amp.r) * 0.08
      amp.n += (motion.ninjaAmp - amp.n) * 0.08
      const speed = 1 + amp.n * 0.9
      hem.setAttribute('d', hemPath(time * 1.6, amp.r))
      ribA.setAttribute('d', ribbonPath(time * 3.2 * speed, amp.n, 86, 0))
      ribB.setAttribute('d', ribbonPath(time * 3.2 * speed + 1.3, amp.n, 70, 8))
    }

    let visible = false
    const setRunning = () => {
      const on = visible && !document.hidden && !reduced
      if (on) {
        particles.start()
        mist.start()
        gsap.ticker.add(tick)
      } else {
        particles.stop()
        mist.stop()
        gsap.ticker.remove(tick)
      }
      frame.classList.toggle('is-live', on)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      setRunning()
    })
    io.observe(sectionRef.current)
    document.addEventListener('visibilitychange', setRunning)

    const onResize = () => {
      applyLayout()
      particles.resize()
      mist.resize()
      if (reduced) {
        staticFrame({ els, rigs, particles, getLayout })
        mist.draw(0)
      } else hero?.refresh()
    }
    window.addEventListener('resize', onResize)

    // First canvas frame is ready: tell the loader.
    particles.drawOnce()
    mist.draw(0)
    requestAnimationFrame(() => readyRef.current?.())

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', setRunning)
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
      particles.destroy()
      mist.stop()
      hero?.kill()
      split?.revert()
    }
  }, [reduced, mobile])

  // Pointer parallax (desktop, fine pointer, motion allowed).
  useEffect(() => {
    if (reduced || isTouch() || mobile) return
    const layers = [...cameraRef.current.querySelectorAll(':scope > .layer')]
      .map((el) => ({ inner: el.querySelector(':scope > .layer__in'), depth: +el.dataset.depth || 0 }))
      .filter((l) => l.inner)
      .map((l) => ({ ...l, qx: gsap.quickTo(l.inner, 'x', { duration: 0.9, ease: 'power3.out' }), qy: gsap.quickTo(l.inner, 'y', { duration: 0.9, ease: 'power3.out' }) }))
    const onMove = (e) => {
      const ox = e.clientX / window.innerWidth - 0.5
      const oy = e.clientY / window.innerHeight - 0.5
      for (const l of layers) {
        l.qx(-ox * l.depth * 18)
        l.qy(-oy * l.depth * 18)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, mobile])

  // Opening: letterbox in, fade from black, credit, title card, scroll hint.
  useEffect(() => {
    if (!started) return
    if (reduced) {
      gsap.set(blackRef.current, { opacity: 0 })
      gsap.set([cardRef.current, kanjiWrapRef.current, hintRef.current], { opacity: 1 })
      gsap.set([lbTopRef.current, lbBottomRef.current], { yPercent: 0 })
      return
    }
    const tl = gsap.timeline()
    tl.fromTo(lbTopRef.current, { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0)
      .fromTo(lbBottomRef.current, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0)
      .to(blackRef.current, { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 0.2)
      .fromTo(creditRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
      .to(creditRef.current, { opacity: 0, duration: 0.4 }, 1.4)
      .fromTo(cardRef.current, { opacity: 0, letterSpacing: '0.18em' }, { opacity: 1, letterSpacing: '0.04em', duration: 1.2, ease: 'power3.out' }, 1.7)
      .fromTo(kanjiWrapRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 2.0)
      .fromTo(hintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.6)
    return () => tl.kill()
  }, [started, reduced])

  return (
    <section id="prologue" ref={sectionRef} className="hero" aria-labelledby="hero-name" data-chapter="prologue">
      <div className="hero__frame" ref={frameRef}>
        <div className="camera" ref={cameraRef} aria-hidden="true">
          <Layer depth={DEPTHS.sky} className="layer--sky">
            <Sky />
          </Layer>
          <Layer depth={DEPTHS.moon}>
            <Moon />
          </Layer>
          {video && (
            <Layer depth={DEPTHS.video} className="layer--video">
              <video src={video} muted loop playsInline autoPlay />
            </Layer>
          )}
          <Layer depth={DEPTHS.mountains}>
            <Mountains />
          </Layer>
          <Layer depth={DEPTHS.castle}>
            <div className="castle-wrap">
              <Castle />
            </div>
          </Layer>
          <Layer depth={DEPTHS.mist} inner={false}>
            <canvas className="mist" ref={mistRef} />
          </Layer>
          <Layer depth={DEPTHS.hill}>
            <svg className="hill" viewBox="0 0 1000 200" preserveAspectRatio="none" focusable="false">
              <path fill="#0c0203" d="M0 200 L0 40 C 120 10, 260 0, 380 18 C 520 40, 700 90, 1000 120 L1000 200 Z" />
              <path fill="none" stroke="#8e1219" strokeOpacity="0.5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" d="M0 40 C 120 10, 260 0, 380 18 C 520 40, 700 90, 1000 120" />
            </svg>
            <div className="char ronin-wrap" ref={roninWrapRef}>
              <Ronin svgRef={roninSvgRef} />
            </div>
          </Layer>
          <Layer depth={DEPTHS.grove}>
            <div className="grove">
              <Grove />
            </div>
          </Layer>
          <Layer depth={DEPTHS.ninja}>
            <div className="char ninja-wrap" ref={ninjaWrapRef}>
              <Ninja svgRef={ninjaSvgRef} />
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="crow-wrap" ref={(el) => (crowsRef.current[i] = el)}>
                <Crow style={{ animationDelay: `-${i * 0.13}s` }} />
              </div>
            ))}
            <svg className="speed" ref={speedRef} viewBox="0 0 1000 400" preserveAspectRatio="none" focusable="false">
              {Array.from({ length: 16 }, (_, i) => (
                <line key={i} x1={(i * 137) % 900} x2={((i * 137) % 900) + 120 + (i % 4) * 60} y1={120 + ((i * 53) % 260)} y2={120 + ((i * 53) % 260)} stroke="#ecdfc7" strokeOpacity={0.25 + (i % 3) * 0.15} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </Layer>
          <Layer depth={DEPTHS.particles} inner={false}>
            <canvas className="particles" ref={particlesRef} />
          </Layer>
          <Layer depth={DEPTHS.fore} className="layer--fore">
            <Foreground />
          </Layer>
        </div>

        <div className="hero__type">
          <div className="hero__card" ref={cardRef}>
            <h1 id="hero-name" className="hero__name" ref={nameRef}>
              {profile.name}
            </h1>
            <p className="hero__role">
              <span className="hero__roleText" ref={roleRef}>
                {profile.heroRoleLine}
                {['a', 'b', 'c'].map((k, i) => (
                  <span key={k} className={`shuriken shuriken--${k}`} ref={(el) => (shurikenRef.current[i] = el)} aria-hidden="true">
                    <Shuriken size={mobile ? 26 : 38} />
                  </span>
                ))}
              </span>
            </p>
            <p className="sr-only">
              {profile.name} is an {profile.role} at {profile.company}, based in {profile.location}. {profile.objective}
            </p>
          </div>
          <div className="hero__kanji" ref={kanjiWrapRef} aria-hidden="true">
            <span ref={kanjiRef} lang="ja">
              人工知能の侍
            </span>
          </div>
          <p className="hero__credit" ref={creditRef} aria-hidden="true">
            A portfolio in six chapters
          </p>
          <div className="hero__hint" ref={hintRef} aria-hidden="true">
            <svg viewBox="0 0 80 40" width="80" height="40" focusable="false">
              <path d="M6 26 C 20 18, 46 16, 74 22" stroke="#ecdfc7" strokeOpacity="0.5" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </svg>
            <span>Scroll</span>
            <i className="hero__drop" />
          </div>
        </div>

        <svg className="slash" ref={slashWrapRef} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <filter id="slash-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
            <linearGradient id="slash-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff8e6" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="1" stopColor="#c8a24a" />
            </linearGradient>
          </defs>
          <line data-cut="" x1="62" y1="-2" x2="38" y2="102" pathLength="1" strokeDasharray="1" strokeDashoffset="1" stroke="#d23a2a" strokeWidth="2.4" filter="url(#slash-glow)" opacity="0.9" />
          <line data-cut="" ref={slashRef} x1="62" y1="-2" x2="38" y2="102" pathLength="1" strokeDasharray="1" strokeDashoffset="1" stroke="url(#slash-grad)" strokeWidth="0.5" strokeLinecap="round" />
        </svg>
        <div className="flash" ref={flashRef} aria-hidden="true" />
        <Subtitle text={subtitle} />
        <div className="letterbox letterbox--top" ref={lbTopRef} aria-hidden="true" />
        <div className="letterbox letterbox--bottom" ref={lbBottomRef} aria-hidden="true" />
        <div className="hero__black" ref={blackRef} aria-hidden="true" />
      </div>
    </section>
  )
}
