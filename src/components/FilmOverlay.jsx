import { useEffect, useMemo, useRef } from 'react'

/** One 256×256 noise tile rendered once to a data URL. */
function grainTile() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const img = g.createImageData(256, 256)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}

/**
 * Film grain, vignette, flicker (hero only) and occasional scratches.
 * @param {{ hero: boolean, reduced: boolean, rewinding: boolean, burn: number }} props
 */
export default function FilmOverlay({ hero, reduced, rewinding, burn }) {
  const tile = useMemo(() => grainTile(), [])
  const scratchRef = useRef(null)
  const burnRef = useRef(null)

  // Scratches: 1–2 brief vertical lines every ~4 s.
  useEffect(() => {
    if (reduced) return
    let timer
    const el = scratchRef.current
    const schedule = () => {
      timer = setTimeout(() => {
        if (!document.hidden) {
          el.style.left = `${Math.random() * 100}%`
          el.classList.remove('is-on')
          void el.offsetWidth
          el.classList.add('is-on')
        }
        schedule()
      }, 1600 + Math.random() * 2600)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [reduced])

  // Cigarette burn on reel change.
  useEffect(() => {
    if (!burn || reduced) return
    const el = burnRef.current
    el.classList.remove('is-on')
    void el.offsetWidth
    el.classList.add('is-on')
  }, [burn, reduced])

  return (
    <div className={`film ${hero ? 'film--hero' : ''} ${reduced ? 'film--still' : ''} ${rewinding ? 'film--rewind' : ''}`} aria-hidden="true">
      <div className="film__grain" style={{ backgroundImage: `url(${tile})` }} />
      <div className="film__vignette" />
      <div className="film__flicker" />
      <div className="film__scratch" ref={scratchRef} />
      <div className="film__rewind" />
      <div className="film__burn" ref={burnRef} />
    </div>
  )
}
