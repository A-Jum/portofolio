/** Builds the shared noise buffers once: white 2 s and brown 4 s (both loopable). */
export function createNoiseBuffers(ctx) {
  const sr = ctx.sampleRate

  const white = ctx.createBuffer(1, sr * 2, sr)
  const w = white.getChannelData(0)
  for (let i = 0; i < w.length; i++) w[i] = Math.random() * 2 - 1

  const brown = ctx.createBuffer(1, sr * 4, sr)
  const b = brown.getChannelData(0)
  let last = 0
  for (let i = 0; i < b.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    b[i] = last * 3.5
  }
  // Crossfade the tail into the head so the loop has no click.
  const fade = Math.floor(sr * 0.05)
  for (let i = 0; i < fade; i++) {
    const k = i / fade
    b[b.length - fade + i] = b[b.length - fade + i] * (1 - k) + b[i] * k
  }

  return { white, brown }
}
