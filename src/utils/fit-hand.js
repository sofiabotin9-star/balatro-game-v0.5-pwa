// Fit actual card boxes, including selection headroom, to the available region.
export function handGeometry(width, height, count) {
  const n = Math.max(1, count)
  const available = Math.max(0, width - 16)
  const card = Math.max(0, Math.min(100, (height - 32) / 1.4, available / (1 + (n - 1) * .78)))
  const gap = n > 1 ? Math.min(6, (available - n * card) / (n - 1)) : 0
  return { card, gap }
}

const observers = new WeakMap()
function fit(el) {
  const { card, gap } = handGeometry(el.clientWidth, el.clientHeight, el.children.length)
  el.style.setProperty('--hand-card-width', `${card}px`)
  el.style.setProperty('--hand-card-gap', `${gap}px`)
}
export const vFitHand = {
  mounted(el) {
    const observer = new ResizeObserver(() => fit(el))
    observer.observe(el)
    observers.set(el, observer)
    fit(el)
  },
  updated: fit,
  unmounted(el) { observers.get(el)?.disconnect(); observers.delete(el) }
}
