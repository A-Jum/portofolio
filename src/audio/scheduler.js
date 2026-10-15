/**
 * Lookahead scheduler: a 25 ms interval schedules events up to 100 ms ahead of ctx.currentTime.
 * Each task is a function `(time) => nextTime | null`; returning null removes the task.
 */
export function createScheduler(ctx, { interval = 25, lookahead = 0.1 } = {}) {
  /** @type {Map<string, { next: number, fn: (t: number) => number|null }>} */
  const tasks = new Map()
  let timer = null

  function tick() {
    const horizon = ctx.currentTime + lookahead
    for (const [name, task] of tasks) {
      let guard = 0
      while (task.next < horizon && guard++ < 16) {
        const next = task.fn(Math.max(task.next, ctx.currentTime))
        if (next == null) {
          tasks.delete(name)
          break
        }
        task.next = next
      }
    }
  }

  return {
    add(name, fn, delay = 0) {
      tasks.set(name, { next: ctx.currentTime + delay, fn })
    },
    remove(name) {
      tasks.delete(name)
    },
    has: (name) => tasks.has(name),
    clear() {
      tasks.clear()
    },
    start() {
      if (!timer) timer = setInterval(tick, interval)
    },
    stop() {
      clearInterval(timer)
      timer = null
    },
  }
}
