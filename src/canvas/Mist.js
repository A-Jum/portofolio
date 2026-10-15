import { rng } from '../lib/rng.js'

/** Drifting mid-ground fog, drawn at quarter resolution and scaled up by CSS. */
export class Mist {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas, { scale = 0.25 } = {}) {
    this.canvas = canvas
    this.g = canvas.getContext('2d')
    this.scale = scale
    const r = rng(23)
    this.blobs = Array.from({ length: 9 }, () => ({
      x: r(),
      y: 0.45 + r() * 0.45,
      rx: 0.25 + r() * 0.3,
      ry: 0.06 + r() * 0.08,
      v: (0.004 + r() * 0.01) * (r() < 0.5 ? 1 : -1),
      a: 0.1 + r() * 0.12,
    }))
    this.running = false
    this.frame = this.frame.bind(this)
    this.resize()
  }

  resize() {
    this.w = Math.max(32, Math.round(this.canvas.clientWidth * this.scale))
    this.h = Math.max(32, Math.round(this.canvas.clientHeight * this.scale))
    this.canvas.width = this.w
    this.canvas.height = this.h
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  frame(now) {
    if (!this.running) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.draw(dt)
    this.raf = requestAnimationFrame(this.frame)
  }

  draw(dt = 0) {
    const { g, w, h } = this
    g.clearRect(0, 0, w, h)
    for (const b of this.blobs) {
      b.x += b.v * dt
      if (b.x > 1.4) b.x = -0.4
      if (b.x < -0.4) b.x = 1.4
      const cx = b.x * w
      const cy = b.y * h
      g.save()
      g.translate(cx, cy)
      g.scale(1, b.ry / b.rx)
      const rad = b.rx * w
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, rad)
      grad.addColorStop(0, `rgba(150, 70, 70, ${b.a})`)
      grad.addColorStop(1, 'rgba(150, 70, 70, 0)')
      g.fillStyle = grad
      g.fillRect(-rad, -rad, rad * 2, rad * 2)
      g.restore()
    }
  }
}
