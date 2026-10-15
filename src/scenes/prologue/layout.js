/** Grove geometry (viewBox 900×1080). The pagoda ridge is where the ninja runs. */
export const GROVE = { w: 900, h: 1080, ridgeY: 548, ridgeFrom: 470, ridgeTo: 150, hideX: 730, hideY: 1060 }

export const RONIN_BOX = { w: 240, h: 420, footX: 110, footY: 410 }
export const NINJA_BOX = { w: 180, h: 380, footX: 90, footY: 372 }

/**
 * Screen-space layout for the hero, derived from the viewport and the 2.39:1 letterbox.
 * Everything the scroll timeline needs (character anchors, grove mapping) is in pixels.
 * @param {number} vw
 * @param {number} vh
 */
export function heroLayout(vw, vh) {
  const portrait = vh > vw
  const mobile = vw < 768
  const lb = portrait ? vh * 0.06 : Math.max(0, (vh - vw / 2.39) / 2)
  const fh = vh - lb * 2
  // Landscape: the grove fills the height on the right. Portrait: a smaller pagoda
  // whose ridge sits just below mid-frame, its body running down off the bottom.
  const s = portrait ? Math.min(vh / GROVE.h, (vw * 0.6) / 764) : vh / GROVE.h
  const groveW = GROVE.w * s
  const groveTop = portrait ? lb + fh * 0.44 - GROVE.ridgeY * s : 0
  const groveLeft = portrait ? vw * 0.72 - 308 * s : vw - groveW + (vw < 1024 ? groveW * 0.1 : 0)
  const g2s = (gx, gy) => ({ x: groveLeft + gx * s, y: groveTop + gy * s })

  const ground = vh - lb - fh * (portrait ? 0.14 : 0.06)
  const roninH = fh * (portrait ? 0.36 : 0.56)
  const ronin = { x: vw * (portrait ? 0.22 : mobile ? 0.2 : 0.18), y: ground, h: roninH, w: (roninH * RONIN_BOX.w) / RONIN_BOX.h }
  const ninjaH = fh * (portrait ? 0.14 : 0.3)
  const ninja = { h: ninjaH, w: (ninjaH * NINJA_BOX.w) / NINJA_BOX.h }

  return { vw, vh, portrait, mobile, lb, fh, s, groveW, groveTop, groveLeft, g2s, ground, ronin, ninja }
}
