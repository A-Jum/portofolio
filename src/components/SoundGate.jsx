import { useEffect, useRef, useState } from 'react'
import { audio } from '../audio/AudioEngine.js'

const KEY = 'aj:sound'

function readPref() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function writePref(v) {
  try {
    localStorage.setItem(KEY, v)
  } catch {
    /* storage blocked */
  }
}

function GateContent({ live, withRef, silentRef }) {
  return (
    <div className="gate__content">
      <span className="gate__kanji" lang="ja" aria-hidden="true">
        音
      </span>
      <p className="gate__jp" lang="ja" aria-hidden="true">
        音を鳴らしますか？
      </p>
      <h2 className="gate__title" id={live ? 'gate-title' : undefined}>
        Watch with sound?
      </h2>
      <p className="gate__text" id={live ? 'gate-desc' : undefined}>
        Taiko drums, shakuhachi flute and wind, all composed in code for this page. You can switch sound on or off at any time from the corner.
      </p>
      <div className="gate__actions">
        <button ref={withRef} type="button" className="btn btn--primary" data-choice="on" tabIndex={live ? 0 : -1}>
          Watch with sound
        </button>
        <button ref={silentRef} type="button" className="btn btn--ghost" data-choice="off" tabIndex={live ? 0 : -1}>
          Watch in silence
        </button>
      </div>
    </div>
  )
}

/**
 * Sound permission dialog shown on every visit after the loader.
 * The click on "Watch with sound" is the user gesture that unlocks the AudioContext.
 * @param {{ reduced: boolean, onDone: (sound: boolean) => void }} props
 */
export default function SoundGate({ reduced, onDone }) {
  const withRef = useRef(null)
  const silentRef = useRef(null)
  const [leaving, setLeaving] = useState(false)
  const busy = useRef(false)

  useEffect(() => {
    const pref = readPref()
    ;(pref === 'off' ? silentRef : withRef).current?.focus()
  }, [])

  async function choose(sound) {
    if (busy.current) return
    busy.current = true
    writePref(sound ? 'on' : 'off')
    if (sound) {
      try {
        await audio.enable()
        audio.play('clap')
      } catch {
        /* audio unavailable: continue silently */
      }
    }
    setLeaving(true)
    setTimeout(() => onDone(sound), reduced ? 300 : 700)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      choose(false)
    } else if (e.key === 'Tab') {
      const items = [withRef.current, silentRef.current]
      const i = items.indexOf(document.activeElement)
      e.preventDefault()
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length
      items[next].focus()
    }
  }

  function onClick(e) {
    const btn = e.target.closest('[data-choice]')
    if (btn) choose(btn.dataset.choice === 'on')
  }

  return (
    <div
      className={`gate ${leaving ? 'is-leaving' : ''} ${reduced ? 'is-reduced' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      aria-describedby="gate-desc"
      onKeyDown={onKeyDown}
    >
      {!leaving && (
        <div className="gate__live" onClick={onClick}>
          <GateContent live withRef={withRef} silentRef={silentRef} />
        </div>
      )}
      {leaving && !reduced && (
        <>
          <div className="gate__half gate__half--a" aria-hidden="true" inert>
            <GateContent live={false} />
          </div>
          <div className="gate__half gate__half--b" aria-hidden="true" inert>
            <GateContent live={false} />
          </div>
          <svg className="gate__cut" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="62" y1="0" x2="38" y2="100" pathLength="1" />
          </svg>
        </>
      )}
    </div>
  )
}
