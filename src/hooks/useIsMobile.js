import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 767px)'

function subscribe(cb) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export const isMobileNow = () => window.matchMedia(QUERY).matches
export const isTouch = () => window.matchMedia('(pointer: coarse)').matches

export function useIsMobile() {
  return useSyncExternalStore(subscribe, isMobileNow, () => false)
}
