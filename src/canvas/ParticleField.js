import { rng } from '../lib/rng.js'

const RAIN_ANGLE = (12 * Math.PI) / 180

function sprite(size, draw) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  return c
}

function petalSprite(color) {
  return sprite(32, (g, s) => {
    g.translate(s / 2, s / 2)
    g.fillStyle = color
    g.beginPath()
    // Two bezier lobes meeting at a notched tip.
    g.moveTo(0, 13)
    g.bezierCurveTo(-11, 6, -9, -9, -2, -13)
    g.lineTo(0, -9)
    g.lineTo(2, -13)
    g.bezierCurveTo(9, -9, 11, 6, 0, 13)
    g.fill()
    g.globalAlpha = 0.25
    g.fillStyle = '#ffffff'
    g.beginPath()
    g.ellipse(-2, 2, 2, 6, 0.2, 0, Math.PI * 2)
    g.fill()
  })
}

const softDot = (inner, outer) =>
  sprite(64, (g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    r.addColorStop(0, inner)
    r.addColorStop(1, outer)
    g.fillStyle = r
    g.fillRect(0, 0, s, s)
  })

/**
 * Hero particle layer: sakura petals, embers, rain, smoke puffs and a stray ribbon.
 * Runs its own rAF loop which the owner pauses when the hero is off-screen.
 */
export class ParticleField {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ mobile?: boolean, tablet?: boolean }} opts
   */
  constructor(canvas, { mobile = false, tablet = false } = {}) {
    this.canvas = canvas
    this.g = canvas.getContext('2d')
    this.mobile = mobile
    this.dprMax = mobile ? 1.5 : 2
    this.r = rng(7)
    this.rain = 0
    this.rainMax = mobile ? 30 : tablet ? 180 : 300
    this.wind = 0
    this.windTarget = 0
    this.swirl = 0
    this.running = false
    this.last = 0
    this.smoke = []
    this.ribbons = []
    this.sprites = {
      petals: ['#e9c7c0', '#d9a8a4', '#b98583', '#c99a96'].map(petalSprite),
      ember: softDot('rgba(255,190,110,1)', 'rgba(210,58,42,0)'),
      smoke: softDot('rgba(120,96,94,0.55)', 'rgba(60,40,40,0)'),
    }
    this.resize()
    const nPetals = mobile ? 24 : tablet ? 45 : 72
    const nEmbers = mobile ? 10 : tablet ? 22 : 34
    this.petals = Array.from({ length: nPetals }, () => this.newPetal(true))
    this.embers = Array.from({ length: nEmbers }, () => this.newEmber(true))
    this.drops = Array.from({ length: this.rainMax }, () => this.newDrop(true))
    this.frame = this.frame.bind(this)
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprMax)
    const { clientWidth: w, clientHeight: h } = this.canvas
    this.w = w
    this.h = h
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  newPetal(anywhere = false) {
    const r = this.r
    return {
      x: r() * this.w * 1.2 - this.w * 0.1,
      y: anywhere ? r() * this.h : -20 - r() * 60,
      size: 6 + r() * 8,
      vy: 20 + r() * 30,
      sway: 0.6 + r() * 1.4,
      ph: r() * Math.PI * 2,
      rot: r() * Math.PI * 2,
      vrot: (r() - 0.5) * 1.6,
      flip: r() * Math.PI * 2,
      vflip: 1 + r() * 2.5,
      img: this.sprites.petals[Math.floor(r() * 4)],
      alpha: 0.55 + r() * 0.4,
    }
  }

  newEmber(anywhere = false) {
    const r = this.r
    return {
      x: r() * this.w,
      y: anywhere ? r() * this.h : this.h + 10,
      vy: -(14 + r() * 26),
      ph: r() * 10,
      size: 1.5 + r() * 2.5,
      tw: 2 + r() * 5,
    }
  }

  newDrop(anywhere = false) {
    const r = this.r
    return {
      x: r() * (this.w + 200) - 100,
      y: anywhere ? r() * this.h : -30 - r() * this.h * 0.3,
      len: 12 + r() * 16,
      v: 900 + r() * 400,
      a: 0.15 + r() * 0.2,
    }
  }

  /** @param {number} x 0..1 */
  setRain(x) {
    this.rain = Math.max(0, Math.min(1, x))
  }

  /** Scroll velocity (px per frame-ish) pushes petals sideways. */
  setWind(v) {
    this.windTarget = Math.max(-1, Math.min(1, v)) * 140
  }

  setSwirl(x) {
    this.swirl = Math.max(0, Math.min(1, x))
  }

  /** Ninja vanishes: a soft smoke burst at screen point (x, y). */
  puff(x, y, scale = 1) {
    const r = this.r
    for (let i = 0; i < 30; i++) {
      const a = r() * Math.PI * 2
      const s = (20 + r() * 70) * scale
      this.smoke.push({ x: x + (r() - 0.5) * 30 * scale, y: y - r() * 80 * scale, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - 20, r0: (10 + r() * 16) * scale, t: 0, life: 0.9 + r() * 0.5 })
    }
    this.ribbons.push({ x, y: y - 120 * scale, t: 0, life: 5, ph: 0, scale })
    if (!this.running) this.drawOnce()
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

  destroy() {
    this.stop()
  }

  drawOnce() {
    this.step(0)
  }

  frame(now) {
    if (!this.running) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.step(dt)
    this.raf = requestAnimationFrame(this.frame)
  }

  step(dt) {
    const { g, w, h } = this
    this.wind += (this.windTarget - this.wind) * Math.min(1, dt * 3)
    this.windTarget *= Math.pow(0.2, dt)
    g.clearRect(0, 0, w, h)

    // Embers (additive glow).
    g.globalCompositeOperation = 'lighter'
    for (const e of this.embers) {
      e.y += e.vy * dt
      e.ph += dt * e.tw
      e.x += (Math.sin(e.ph * 0.7) * 10 + this.wind * 0.15) * dt
      if (e.y < -20) Object.assign(e, this.newEmber())
      const a = 0.35 + 0.35 * Math.sin(e.ph)
      const s = e.size * 6
      g.globalAlpha = Math.max(0, a)
      g.drawImage(this.sprites.ember, e.x - s / 2, e.y - s / 2, s, s)
    }
    g.globalCompositeOperation = 'source-over'

    // Smoke.
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i]
      s.t += dt
      if (s.t > s.life) {
        this.smoke.splice(i, 1)
        continue
      }
      const k = s.t / s.life
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vx *= 0.96
      s.vy *= 0.96
      const rad = s.r0 * (1 + k * 2.6) * 2
      g.globalAlpha = (1 - k) * 0.9
      g.drawImage(this.sprites.smoke, s.x - rad / 2, s.y - rad / 2, rad, rad)
    }

    // Petals.
    const cx = w * 0.5
    const cy = h * 0.5
    for (const p of this.petals) {
      p.ph += dt * p.sway
      p.rot += p.vrot * dt
      p.flip += p.vflip * dt
      let vx = Math.sin(p.ph) * 24 + 12 + this.wind
      let vy = p.vy
      if (this.swirl > 0) {
        const dx = p.x - cx
        const dy = p.y - cy
        const d = Math.hypot(dx, dy) + 1
        vx += (-dy / d) * 380 * this.swirl - (dx / d) * 60 * this.swirl
        vy += (dx / d) * 380 * this.swirl - (dy / d) * 60 * this.swirl
      }
      p.x += vx * dt
      p.y += vy * dt
      if (p.y > h + 30 || p.x > w + 60 || p.x < -60 || p.y < -80) Object.assign(p, this.newPetal())
      g.save()
      g.translate(p.x, p.y)
      g.rotate(p.rot)
      g.scale(Math.cos(p.flip), 1)
      g.globalAlpha = p.alpha
      g.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size)
      g.restore()
    }

    // Stray ribbon from the vanished ninja.
    for (let i = this.ribbons.length - 1; i >= 0; i--) {
      const rb = this.ribbons[i]
      rb.t += dt
      if (rb.t > rb.life) {
        this.ribbons.splice(i, 1)
        continue
      }
      rb.ph += dt * 6
      rb.x += (90 + this.wind * 0.5) * dt
      rb.y -= (28 - rb.t * 4) * dt
      const len = 70 * rb.scale
      g.globalAlpha = Math.min(1, (rb.life - rb.t) / 1.5)
      g.fillStyle = '#8e1219'
      g.beginPath()
      const pts = 8
      for (let k = 0; k <= pts; k++) {
        const u = k / pts
        g.lineTo(rb.x - u * len, rb.y + Math.sin(rb.ph + u * 5) * 9 * rb.scale * u - 2)
      }
      for (let k = pts; k >= 0; k--) {
        const u = k / pts
        g.lineTo(rb.x - u * len, rb.y + Math.sin(rb.ph + u * 5) * 9 * rb.scale * u + 2 + (1 - u) * 2)
      }
      g.fill()
    }

    // Rain: batch strokes.
    const active = Math.floor(this.drops.length * this.rain)
    if (active > 0) {
      const sx = Math.sin(RAIN_ANGLE)
      const cy2 = Math.cos(RAIN_ANGLE)
      g.strokeStyle = '#d9c9c0'
      g.lineWidth = 1
      for (const band of [0, 1]) {
        g.globalAlpha = band ? 0.32 : 0.18
        g.beginPath()
        for (let i = band; i < active; i += 2) {
          const d = this.drops[i]
          d.x -= sx * d.v * dt
          d.y += cy2 * d.v * dt
          if (d.y > h + 30) Object.assign(d, this.newDrop())
          g.moveTo(d.x, d.y)
          g.lineTo(d.x + sx * d.len, d.y - cy2 * d.len)
        }
        g.stroke()
      }
    }
    g.globalAlpha = 1
  }
}
