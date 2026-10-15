import { useEffect, useState } from 'react'

/**
 * Reports whether an element is in view. With `once`, stays true after the first hit.
 * @param {import('react').RefObject<Element>} ref
 * @param {{ once?: boolean, rootMargin?: string, threshold?: number }} [opts]
 */
export function useInView(ref, { once = false, rootMargin = '0px', threshold = 0 } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) setInView(false)
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, once, rootMargin, threshold])
  return inView
}
