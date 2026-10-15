import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { audio } from '../audio/AudioEngine.js'
import { profile } from '../data/profile.js'
import ChapterKanji from './ChapterKanji.jsx'

/** 第三章 修行 — education and certificates as wooden name boards on a dojo wall. */
export default function Training({ reduced }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    if (reduced) return
    const boards = [...sectionRef.current.querySelectorAll('.nafuda')]
    let lastSwing = 0
    let lastKnock = 0
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const now = performance.now()
        if (now - lastSwing < 90) return
        const v = self.getVelocity()
        if (Math.abs(v) < 80) return
        lastSwing = now
        const push = gsap.utils.clamp(-9, 9, -v / 180)
        boards.forEach((b, i) => {
          const k = 0.7 + ((i * 37) % 10) / 20
          gsap.to(b, {
            rotation: push * k,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: true,
            onComplete: () => gsap.to(b, { rotation: 0, duration: 2.2, ease: 'elastic.out(1, 0.25)' }),
          })
        })
        if (Math.abs(v) > 900 && now - lastKnock > 450) {
          lastKnock = now
          audio.play('knock')
        }
      },
    })
    return () => {
      st.kill()
      gsap.killTweensOf(boards)
      gsap.set(boards, { rotation: 0 })
    }
  }, [reduced])

  return (
    <section id="training" ref={sectionRef} className="chapter training" aria-labelledby="training-title" tabIndex={-1} data-chapter="training">
      <div className="chapter__inner">
        <h2 id="training-title" className="chapter__title">
          Training
        </h2>
        <div className="dojo">
          <div className="dojo__beam" aria-hidden="true" />
          <ul className="dojo__boards">
            {profile.training.map((t) => (
              <li key={t.id} className="nafuda-slot">
                <article className={`nafuda nafuda--${t.id}`} aria-labelledby={`tr-${t.id}`}>
                  <span className="nafuda__peg" aria-hidden="true" />
                  <span className="nafuda__mark" lang="ja" aria-hidden="true">
                    {t.kanji}
                  </span>
                  <h3 id={`tr-${t.id}`} className="nafuda__name">
                    {t.name}
                  </h3>
                  <p className="nafuda__issuer">{t.issuer}</p>
                  <p className="nafuda__dates">
                    {t.dates.map((d, i) => (
                      <span key={d}>
                        {i > 0 && <span className="nafuda__and"> and </span>}
                        {d}
                      </span>
                    ))}
                  </p>
                  {t.lines.length > 0 && (
                    <ul className="nafuda__lines">
                      {t.lines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  )}
                  {t.url && (
                    <a className="nafuda__link" href={t.url} target="_blank" rel="noopener noreferrer">
                      View certificate
                    </a>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ChapterKanji>第三章 修行</ChapterKanji>
    </section>
  )
}
