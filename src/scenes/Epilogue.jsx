import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap.js'
import { profile } from '../data/profile.js'
import { KamonShape } from '../components/Kamon.jsx'
import ChapterKanji from './ChapterKanji.jsx'

const CREDITS = [
  ['Written and directed by', profile.name],
  ['Starring', `${profile.name} as the ${profile.role}`],
  ['Filmed on location in', 'Bandung, Indonesia'],
  ['Score composed in', 'the Web Audio API'],
  ['Ronin and ninja drawn in', 'SVG'],
]

/** 終章 縁 — rolling credits, real contact links and the closing 終. */
export default function Epilogue({ reduced, onRewind }) {
  const rollRef = useRef(null)
  const sectionRef = useRef(null)
  const { contact } = profile

  useEffect(() => {
    if (reduced) return
    const tween = gsap.fromTo(
      rollRef.current,
      { y: '18vh' },
      {
        y: '-12vh',
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'center center', scrub: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [reduced])

  const socials = [
    ['LinkedIn', contact.linkedin],
    ['GitHub', contact.github],
    ['Website', contact.website],
  ].filter(([, url]) => url)

  return (
    <section id="epilogue" ref={sectionRef} className="chapter epilogue" aria-labelledby="epilogue-title" tabIndex={-1} data-chapter="epilogue">
      <div className="chapter__inner epilogue__inner">
        <h2 id="epilogue-title" className="sr-only">
          Epilogue: contact
        </h2>
        <div className="credits" ref={rollRef}>
          {CREDITS.map(([role, who]) => (
            <p key={role} className="credits__line">
              <span className="credits__role">{role}</span>
              <span className="credits__who">{who}</span>
            </p>
          ))}
        </div>

        <address className="contact">
          <p className="contact__lead">The road continues. Send word.</p>
          <div className="contact__actions">
            <a className="btn btn--primary btn--brush" href={`mailto:${contact.email}`}>
              Send an email
            </a>
            <a className="btn btn--ghost" href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
              Message on WhatsApp
            </a>
          </div>
          <ul className="contact__list">
            <li>
              <span className="contact__k">Email</span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <span className="contact__k">Phone</span>
              <a href={contact.phoneTel}>{contact.phoneDisplay}</a>
            </li>
            <li>
              <span className="contact__k">Location</span>
              <span>{profile.location}</span>
            </li>
            {socials.map(([label, url]) => (
              <li key={label}>
                <span className="contact__k">{label}</span>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url.replace(/^https?:\/\//, '')}
                </a>
              </li>
            ))}
          </ul>
        </address>

        <div className="fin">
          <span className="fin__kanji" lang="ja" aria-hidden="true">
            終
          </span>
          <svg className="fin__seal" viewBox="-56 -56 112 112" aria-hidden="true" focusable="false">
            <rect x="-54" y="-54" width="108" height="108" rx="10" fill="#8e1219" />
            <g transform="scale(0.9)" style={{ color: '#ecdfc7' }}>
              <KamonShape />
            </g>
          </svg>
        </div>
        <button type="button" className="btn btn--ghost rewind-btn" onClick={onRewind}>
          Back to the beginning
        </button>
      </div>
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
      </footer>
      <ChapterKanji>終章 縁</ChapterKanji>
    </section>
  )
}
