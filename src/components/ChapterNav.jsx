import { useEffect, useRef, useState } from 'react'
import { chapters } from '../data/profile.js'
import { scrollToTarget } from '../lib/lenis.js'

function go(id) {
  if (id === 'prologue') scrollToTarget(0)
  else scrollToTarget(`#${id}`)
  const el = document.getElementById(id)
  // Move focus for keyboard and screen reader users without jumping the scroll.
  setTimeout(() => el?.focus({ preventScroll: true }), 50)
}

/** Vertical kanji column on desktop; a "Chapters" sheet on mobile. */
export default function ChapterNav({ active }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (!open) return
    sheetRef.current?.querySelector('a')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const onPick = (e, id) => {
    e.preventDefault()
    setOpen(false)
    go(id)
  }

  return (
    <nav className="chapter-nav" aria-label="Chapters">
      <ol className="chapter-nav__rail">
        {chapters.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className={`chapter-nav__link ${active === c.id ? 'is-active' : ''}`}
              aria-current={active === c.id ? 'true' : undefined}
              onClick={(e) => onPick(e, c.id)}
            >
              <span className="chapter-nav__kanji" lang="ja" aria-hidden="true">
                {c.nav}
              </span>
              <span className="chapter-nav__tip">{c.title}</span>
            </a>
          </li>
        ))}
      </ol>

      <button
        ref={btnRef}
        type="button"
        className="chapter-nav__toggle"
        aria-expanded={open}
        aria-controls="chapter-sheet"
        onClick={() => setOpen((v) => !v)}
      >
        Chapters
      </button>
      <div id="chapter-sheet" ref={sheetRef} className={`chapter-sheet ${open ? 'is-open' : ''}`} hidden={!open}>
        <ol>
          {chapters.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className={active === c.id ? 'is-active' : ''}
                aria-current={active === c.id ? 'true' : undefined}
                onClick={(e) => onPick(e, c.id)}
              >
                <span lang="ja" aria-hidden="true">
                  {c.nav}
                </span>
                {c.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
