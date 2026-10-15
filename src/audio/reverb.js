/** Procedural impulse response: stereo noise, 2.8 s, decay power 2.5, 20 ms pre-delay. */
export function createReverb(ctx, seconds = 2.8, power = 2.5, preDelay = 0.02) {
  const sr = ctx.sampleRate
  const pre = Math.floor(sr * preDelay)
  const len = Math.floor(sr * seconds)
  const ir = ctx.createBuffer(2, pre + len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      d[pre + i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, power)
    }
  }
  const conv = ctx.createConvolver()
  conv.buffer = ir
  return conv
}
