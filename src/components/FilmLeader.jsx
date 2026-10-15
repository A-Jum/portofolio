import { useEffect, useRef, useState } from 'react'
import { audio } from '../audio/AudioEngine.js'

const STEP = 0.8

/** Academy-style countdown 3 → 2 → 1 in red and black. Click or Esc skips. */
export default function FilmLeader({ onDone }) {
  const [n, setN] = useState(3)
  const sweepRef = useRef(null)
  const wedgeRef = useRef(null)
  const done = useRef(false)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const finish = () => {
      if (done.current) return
      done.current = true
      doneRef.current()
    }
    const t0 = performance.now()
    let raf
    let shown = 3
    const loop = (now) => {
      const t = (now - t0) / 1000
      const step = Math.floor(t / STEP)
      const frac = (t % STEP) / STEP
      if (step >= 3) return finish()
      const num = 3 - step
      if (num !== shown) {
        shown = num
        setN(num)
        if (num === 2) audio.play('pop2')
      }
      sweepRef.current?.setAttribute('transform', `rotate(${frac * 360})`)
      wedgeRef.current?.setAttribute('stroke-dashoffset', `${1 - frac}`)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const skip = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  return (
    <div className="leader" onClick={skip} aria-hidden="true">
      <svg className="leader__dial" viewBox="-100 -100 200 200" focusable="false">
        <circle r="96" fill="#1f0507" />
        <circle
          ref={wedgeRef}
          r="48"
          fill="none"
          stroke="#3b0a0d"
          strokeWidth="96"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          transform="rotate(-90)"
        />
        <circle r="86" fill="none" stroke="#ecdfc7" strokeOpacity="0.5" strokeWidth="1.2" />
        <circle r="70" fill="none" stroke="#ecdfc7" strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M-100 0 H100 M0 -100 V100" stroke="#ecdfc7" strokeOpacity="0.35" strokeWidth="1" />
        <line ref={sweepRef} x1="0" y1="0" x2="0" y2="-96" stroke="#d23a2a" strokeWidth="2" />
        <text className="leader__num" x="0" y="0" textAnchor="middle" dominantBaseline="central">
          {n}
        </text>
      </svg>
      <button type="button" className="leader__skip" onClick={skip} tabIndex={-1}>
        Skip
      </button>
    </div>
  )
}
