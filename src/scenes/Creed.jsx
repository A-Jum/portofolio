import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { audio } from '../audio/AudioEngine.js'
import { profile } from '../data/profile.js'
import ChapterKanji from './ChapterKanji.jsx'

/** 第一章 志 — the objective beside a hanging scroll that unrolls once. */
export default function Creed({ reduced }) {
  const scrollRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const paper = scrollRef.current.querySelector('.kakejiku__body')
    const rod = scrollRef.current.querySelector('.kakejiku__rod--bottom')
    if (reduced) {
      gsap.set(paper, { clipPath: 'inset(0% 0% 0% 0%)' })
      return
    }
    gsap.set(paper, { clipPath: 'inset(0% 0% 100% 0%)' })
    gsap.set(rod, { yPercent: 0 })
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 20%',
      once: true,
      onEnter: () => {
        audio.play('paper')
        const tl = gsap.timeline()
        tl.to(paper, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut' })
        tl.fromTo(rod, { y: () => -paper.offsetHeight }, { y: 0, duration: 1.6, ease: 'power2.inOut' }, 0)
      },
    })
    gsap.set(rod, { y: -paper.offsetHeight })
    return () => st.kill()
  }, [reduced])

  return (
    <section id="creed" ref={sectionRef} className="chapter creed" aria-labelledby="creed-title" tabIndex={-1} data-chapter="creed">
      <div className="chapter__inner creed__grid">
        <figure className="kakejiku" ref={scrollRef}>
          <div className="kakejiku__rod kakejiku__rod--top" aria-hidden="true" />
          <div className="kakejiku__body">
            <svg className="kakejiku__brocade" aria-hidden="true" focusable="false">
              <defs>
                <pattern id="seigaiha" width="28" height="14" patternUnits="userSpaceOnUse">
                  <g fill="none" stroke="#c8a24a" strokeOpacity="0.18" strokeWidth="0.8">
                    {[13, 9, 5].map((r) => (
                      <g key={r}>
                        <circle cx="14" cy="14" r={r} />
                        <circle cx="0" cy="7" r={r} />
                        <circle cx="28" cy="7" r={r} />
                      </g>
                    ))}
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="#3b0a0d" />
              <rect width="100%" height="100%" fill="url(#seigaiha)" />
            </svg>
            <div className="kakejiku__washi">
              <svg className="kakejiku__photo" viewBox="0 0 187 228" role="img" aria-label={`Portrait of ${profile.name}`}>
                <defs>
                  <filter id="duotone" colorInterpolationFilters="sRGB">
                    <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
                    <feComponentTransfer>
                      <feFuncR type="table" tableValues="0.12 0.93" />
                      <feFuncG type="table" tableValues="0.02 0.87" />
                      <feFuncB type="table" tableValues="0.03 0.78" />
                    </feComponentTransfer>
                  </filter>
                </defs>
                <image href={profile.photo} width="187" height="228" preserveAspectRatio="xMidYMid slice" filter="url(#duotone)" />
              </svg>
              <div className="kakejiku__grain" aria-hidden="true" />
            </div>
          </div>
          <div className="kakejiku__rod kakejiku__rod--bottom" aria-hidden="true" />
        </figure>

        <div className="creed__text">
          <span className="creed__bg" lang="ja" aria-hidden="true">
            志
          </span>
          <h2 id="creed-title" className="chapter__title">
            The Creed
          </h2>
          <p className="creed__objective">{profile.objective}</p>
          <dl className="creed__facts">
            <div>
              <dt>Now</dt>
              <dd>
                {profile.role}, {profile.company}
              </dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Degree</dt>
              <dd>{profile.degree}</dd>
            </div>
          </dl>
        </div>
      </div>
      <ChapterKanji>第一章 志</ChapterKanji>
    </section>
  )
}
