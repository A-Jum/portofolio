import { audio } from '../audio/AudioEngine.js'
import { profile } from '../data/profile.js'
import ChapterKanji from './ChapterKanji.jsx'

let lastTick = 0
/** Metallic tick, at most one every 80 ms. */
function tick() {
  const now = performance.now()
  if (now - lastTick < 80) return
  lastTick = now
  audio.play('tick')
}

/** 第四章 武器 — technologies on a tiered weapon rack. No levels: the CV gives none. */
export default function Arsenal({ reduced }) {
  const sheen = (el) => {
    if (reduced || !el) return
    el.classList.remove('is-sheen')
    void el.offsetWidth
    el.classList.add('is-sheen')
  }

  // Keyboard: focusing a tier sweeps the sheen along its blades.
  const onTierFocus = (e) => {
    if (e.target !== e.currentTarget) return
    const blades = [...e.currentTarget.querySelectorAll('.blade')]
    blades.forEach((b, i) =>
      setTimeout(() => {
        sheen(b)
        tick()
      }, i * 90),
    )
  }

  return (
    <section id="arsenal" className="chapter arsenal" aria-labelledby="arsenal-title" tabIndex={-1} data-chapter="arsenal">
      <div className="chapter__inner">
        <h2 id="arsenal-title" className="chapter__title">
          Arsenal
        </h2>
        <div className="rack">
          {profile.arsenal.map((tier) => (
            <div key={tier.label} className="rack__row">
              <h3 className="rack__label" id={`ars-${tier.label.replace(/\s+/g, '-')}`}>
                {tier.label}
              </h3>
              <ul
                className="rack__tier"
                tabIndex={0}
                aria-labelledby={`ars-${tier.label.replace(/\s+/g, '-')}`}
                onFocus={onTierFocus}
              >
                {tier.items.map((item) => (
                  <li
                    key={item}
                    className="blade"
                    onPointerEnter={(e) => {
                      if (e.pointerType === 'mouse') {
                        sheen(e.currentTarget)
                        tick()
                      }
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <ChapterKanji>第四章 武器</ChapterKanji>
    </section>
  )
}
