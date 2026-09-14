// Lightweight touch ergonomics for the private mobile build.
// No game logic lives here. It only manages press feedback, viewport sizing,
// and a safe vibration fallback on platforms that support navigator.vibrate.

const INTERACTIVE_SELECTOR = [
  'button',
  '[role="button"]',
  '.playing-card',
  '.joker-card',
  '.shop-item-card'
].join(',')

let activePressed = null
let viewportHandler = null
let cleanupFns = []

function isCoarsePointer() {
  return window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ?? false
}

function findInteractive(target) {
  if (!(target instanceof Element)) return null
  return target.closest(INTERACTIVE_SELECTOR)
}

function isDisabled(el) {
  return Boolean(
    el?.matches?.(':disabled') ||
    el?.classList?.contains('disabled') ||
    el?.getAttribute?.('aria-disabled') === 'true'
  )
}

function clearPressed() {
  if (!activePressed) return
  activePressed.classList.remove('is-touch-pressed')
  activePressed = null
}

function softHaptic() {
  // iOS Safari currently ignores navigator.vibrate; this remains a harmless fallback.
  // A native Tauri haptics bridge can replace this later without touching game logic.
  try {
    if (typeof navigator.vibrate === 'function') navigator.vibrate(8)
  } catch {
    // Haptics are optional; never let them affect gameplay.
  }
}

function updateVisualViewportVars() {
  const vv = window.visualViewport
  const width = vv?.width ?? window.innerWidth
  const height = vv?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--visual-viewport-width', `${Math.round(width)}px`)
  document.documentElement.style.setProperty('--visual-viewport-height', `${Math.round(height)}px`)
}

export function installMobileTouchFeedback() {
  updateVisualViewportVars()

  const onPointerDown = (event) => {
    if (!isCoarsePointer()) return
    const el = findInteractive(event.target)
    if (!el || isDisabled(el)) return
    clearPressed()
    activePressed = el
    el.classList.add('is-touch-pressed')
  }

  const onPointerUp = (event) => {
    if (!isCoarsePointer()) return
    const el = findInteractive(event.target)
    const shouldHaptic = Boolean(el && !isDisabled(el))
    clearPressed()
    if (shouldHaptic) softHaptic()
  }

  const onPointerCancel = () => clearPressed()
  const onContextMenu = (event) => {
    if (!isCoarsePointer()) return
    const el = event.target instanceof Element
      ? event.target.closest('.playing-card, .joker-card')
      : null
    if (el) event.preventDefault()
  }

  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  document.addEventListener('pointerup', onPointerUp, { passive: true })
  document.addEventListener('pointercancel', onPointerCancel, { passive: true })
  document.addEventListener('pointerleave', onPointerCancel, { passive: true })
  document.addEventListener('contextmenu', onContextMenu)

  viewportHandler = updateVisualViewportVars
  window.addEventListener('resize', viewportHandler, { passive: true })
  window.visualViewport?.addEventListener('resize', viewportHandler, { passive: true })

  cleanupFns = [
    () => document.removeEventListener('pointerdown', onPointerDown),
    () => document.removeEventListener('pointerup', onPointerUp),
    () => document.removeEventListener('pointercancel', onPointerCancel),
    () => document.removeEventListener('pointerleave', onPointerCancel),
    () => document.removeEventListener('contextmenu', onContextMenu),
    () => window.removeEventListener('resize', viewportHandler),
    () => window.visualViewport?.removeEventListener('resize', viewportHandler)
  ]

  return uninstallMobileTouchFeedback
}

export function uninstallMobileTouchFeedback() {
  clearPressed()
  cleanupFns.forEach((fn) => {
    try { fn() } catch {}
  })
  cleanupFns = []
  viewportHandler = null
}
