import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { audio } from '../audio/AudioEngine.js'
import { profile } from '../data/profile.js'
import { rng } from '../lib/rng.js'
import Ninja from '../characters/Ninja.jsx'
import { buildRig, NINJA_PIVOTS, NINJA_POSES, poseAt, setPose } from '../characters/poses.js'
import ChapterKanji from './ChapterKanji.jsx'
import InkGlyph from './InkGlyph.jsx'

/** Torn paper edge, generated once. */
const EDGE = (() => {
  const r = rng(91)
  const pts = []
  for (let x = 0; x <= 1000; x += 4 + r() * 6) pts.push(`${x.toFixed(1)} ${(4 + r() * 7).toFixed(1)}`)
  return `M0 0 L${pts.join(' L')} L1000 0 Z`
})()

function Edge({ side }) {
  return (
    <svg className={`emaki__edge emaki__edge--${side}`} viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={EDGE} />
    </svg>
  )
}

function Hanko() {
  return (
    <span className="hanko" aria-hidden="true">
      <span lang="ja">誉</span>
    </span>
  )
}

function Field({ job }) {
  return (
    <article className={`field field--${job.id}`} aria-labelledby={`job-${job.id}`}>
      <header className="field__head">
        <p className="field__when">
          {job.start} to {job.end}
        </p>
        <h3 id={`job-${job.id}`} className="field__company">
          {job.company}
        </h3>
        <p className="field__where">{job.city}</p>
        <p className="field__role">
          {job.title}
          <span className="field__type">{job.type}</span>
        </p>
      </header>
      <div className="field__body">
        {job.about && <p className="field__about">{job.about}</p>}
        <p className="field__summary">{job.summary}</p>
        <ul className={`deeds ${job.deeds.some((d) => d.glyph) ? 'deeds--glyphs' : ''}`}>
          {job.deeds.map((d, i) => (
            <li key={i} className={d.glyph === 'honor' ? 'deed deed--honor' : 'deed'}>
              {d.glyph === 'honor' ? <Hanko /> : d.glyph ? <InkGlyph kind={d.glyph} /> : <span className="deed__dot" aria-hidden="true" />}
              <span>{d.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/** 第二章 戦歴 — work history on a horizontal emaki (desktop) or a vertical stack (mobile). */
export default function Battles({ reduced, mobile }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const runnerRef = useRef(null)
  const runnerSvg = useRef(null)
  const emakiRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const stamps = [...section.querySelectorAll('.hanko')]

    // The 誉 stamp lands once when seen.
    const stamp = (el) => {
      audio.play('stamp')
      gsap.fromTo(el, { scale: 1.8, opacity: 0, rotation: -18 }, { scale: 1, opacity: 1, rotation: -8, duration: 0.35, ease: 'power4.in' })
    }

    if (reduced) return
    gsap.set(stamps, { opacity: 0 })
    if (mobile) {
      const v = stamps.map((el) => ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => stamp(el) }))
      return () => v.forEach((t) => t.kill())
    }

    const track = trackRef.current
    const rig = buildRig(runnerSvg.current, NINJA_PIVOTS)
    const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth)
    const keys = [[0, 'run', { cycles: 14 }], [1, 'run']]

    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          const lane = emakiRef.current.clientWidth - runnerRef.current.clientWidth
          gsap.set(runnerRef.current, { x: p * lane })
          setPose(rig, p > 0.995 ? NINJA_POSES.stand : poseAt(keys, NINJA_POSES, p))
        },
      },
    })
    setPose(rig, NINJA_POSES.stand)

    const horiz = stamps.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        containerAnimation: tween,
        start: 'left 80%',
        once: true,
        onEnter: () => stamp(el),
      }),
    )

    return () => {
      horiz.forEach((t) => t.kill())
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(track, { x: 0 })
    }
  }, [reduced, mobile])

  return (
    <section id="battles" ref={sectionRef} className={`chapter battles ${!mobile && !reduced ? 'battles--scroll' : ''}`} aria-labelledby="battles-title" tabIndex={-1} data-chapter="battles">
      <div className="battles__stage">
        <header className="battles__head">
          <h2 id="battles-title" className="chapter__title">
            Battles
          </h2>
          <p className="battles__lede">Three campaigns, the most recent first.</p>
        </header>
        <div className="emaki" ref={emakiRef}>
          <div className="emaki__runner" ref={runnerRef} aria-hidden="true">
            <Ninja svgRef={runnerSvg} faceLeft={false} />
          </div>
          <div className="emaki__scroll">
            <Edge side="top" />
            <div className="emaki__track" ref={trackRef}>
              {profile.jobs.map((job, i) => (
                <div key={job.id} className="emaki__panel">
                  {i > 0 && <span className="emaki__divider" aria-hidden="true" />}
                  <Field job={job} />
                </div>
              ))}
              <span className="emaki__end" lang="ja" aria-hidden="true">
                戦歴
              </span>
            </div>
            <Edge side="bottom" />
          </div>
        </div>
      </div>
      <ChapterKanji>第二章 戦歴</ChapterKanji>
    </section>
  )
}
