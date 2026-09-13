export function isStandalonePwa() {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

export async function registerPwaServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return null

  const protocolOk = location.protocol === 'https:'
    || location.hostname === 'localhost'
    || location.hostname === '127.0.0.1'

  if (!protocolOk) return null

  const base = import.meta.env.BASE_URL || '/'
  try {
    const registration = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base })

    // 等待 Service Worker 完成离线缓存。
    navigator.serviceWorker.ready.then(() => {
      window.dispatchEvent(new CustomEvent('pwa-offline-ready'))
    }).catch(() => {})

    // 尽可能请求持久化存储；浏览器不支持时静默跳过。
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {})
    }

    return registration
  } catch (error) {
    console.warn('[PWA] Service Worker 注册失败：', error)
    return null
  }
}
