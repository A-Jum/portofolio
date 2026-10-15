import { useEffect } from 'react'
import { audio } from '../audio/AudioEngine.js'
import { useAudioState } from '../hooks/useAudioState.js'

async function toggle() {
  const { enabled, muted } = audio.getState()
  if (!enabled) {
    try {
      await audio.enable()
    } catch {
      /* unavailable */
    }
  } else audio.setMuted(!muted)
}

/** Permanent sound switch, bottom right. Keyboard shortcut: M. */
export default function SoundToggle() {
  const { enabled, muted } = useAudioState()
  const on = enabled && !muted

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'm' && e.key !== 'M') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t.closest?.('input, textarea, select, [contenteditable="true"]')) return
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <button
      type="button"
      className={`sound-toggle ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Sound on' : 'Sound off'}
      title="Sound (M)"
      onClick={toggle}
    >
      <span className="sound-toggle__kanji" lang="ja" aria-hidden="true">
        音
      </span>
      <span className="sound-toggle__eq" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}
