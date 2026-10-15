import { useEffect, useRef } from 'react'

/** A slim saya on the left edge; the blade slides out with page progress. */
export default function KatanaProgress() {
  const bladeRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bladeRef.current) bladeRef.current.style.transform = `scaleY(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="katana" aria-hidden="true">
      <div className="katana__tsuka" />
      <div className="katana__tsuba" />
      <div className="katana__track">
        <div className="katana__blade" ref={bladeRef} />
        <div className="katana__saya" />
      </div>
    </div>
  )
}
