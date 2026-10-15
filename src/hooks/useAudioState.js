import { useSyncExternalStore } from 'react'
import { audio } from '../audio/AudioEngine.js'

/** @returns {import('../audio/AudioEngine.js').AudioState} */
export function useAudioState() {
  return useSyncExternalStore(audio.subscribe, audio.getState, audio.getState)
}
