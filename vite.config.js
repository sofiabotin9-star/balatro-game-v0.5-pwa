import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const host = process.env.TAURI_DEV_HOST
const base = process.env.VITE_BASE_PATH || './'

function walkFiles(dir, root = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkFiles(full, root)
    return [path.relative(root, full).split(path.sep).join('/')]
  })
}

function makePwaPrecachePlugin() {
  let resolved

  return {
    name: 'private-pwa-precache',
    apply: 'build',
    configResolved(config) {
      resolved = config
    },
    closeBundle() {
      const outDir = path.resolve(resolved.root, resolved.build.outDir)
      if (!fs.existsSync(outDir)) return

      const files = walkFiles(outDir).filter(file => file !== 'sw.js' && !file.split('/').some(part => part.startsWith('.')))
      const basePath = resolved.base.endsWith('/') ? resolved.base : `${resolved.base}/`
      const urls = files.map(file => `${basePath}${file}`)

      const hash = crypto.createHash('sha256')
      for (const file of files) {
        hash.update(file)
        hash.update(fs.readFileSync(path.join(outDir, file)))
      }
      const version = hash.digest('hex').slice(0, 16)
      const indexUrl = `${basePath}index.html`

      const sw = `
const CACHE_NAME = 'private-joker-pwa-${version}'
const PRECACHE = ${JSON.stringify(urls, null, 2)}
const APP_SHELL = ${JSON.stringify(indexUrl)}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('private-joker-pwa-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          return (await caches.match(request))
            || (await caches.match(APP_SHELL))
            || Response.error()
        })
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
        }
        return response
      })
    })
  )
})
`
      fs.writeFileSync(path.join(outDir, 'sw.js'), sw.trimStart(), 'utf8')
    }
  }
}

// Tauri 推荐配置：固定端口、禁用清屏、忽略 src-tauri 触发 HMR。
// PWA 构建时会在 dist 中生成 sw.js，并预缓存整个游戏资源。
export default defineConfig({
  base,
  plugins: [vue(), makePwaPrecachePlugin()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: 'ws', host, port: 1421 }
      : undefined,
    watch: { ignored: ['**/src-tauri/**'] }
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*']
})
