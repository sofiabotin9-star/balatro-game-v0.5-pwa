<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { isStandalonePwa } from '../utils/pwa.js'

const visible = ref(false)
const offlineReady = ref(false)
const DISMISS_KEY = 'private-joker-pwa-install-hint-dismissed'

function isIOSDevice() {
  const ua = navigator.userAgent || ''
  const classicIOS = /iPad|iPhone|iPod/.test(ua)
  const ipadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return classicIOS || ipadDesktopMode
}

function isSafariBrowser() {
  const ua = navigator.userAgent || ''
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
}

function dismiss() {
  visible.value = false
  try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
}

function markOfflineReady() {
  offlineReady.value = true
}

onMounted(() => {
  offlineReady.value = !!navigator.serviceWorker?.controller
  window.addEventListener('pwa-offline-ready', markOfflineReady)

  let dismissed = false
  try { dismissed = localStorage.getItem(DISMISS_KEY) === '1' } catch {}

  if (!dismissed && isIOSDevice() && isSafariBrowser() && !isStandalonePwa()) {
    window.setTimeout(() => { visible.value = true }, 1200)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pwa-offline-ready', markOfflineReady)
})
</script>

<template>
  <Transition name="pwa-hint">
    <aside v-if="visible" class="pwa-install-hint" role="dialog" aria-label="安装到 iPhone">
      <button class="pwa-install-close" aria-label="关闭" @click="dismiss">×</button>
      <div class="pwa-install-title">安装到 iPhone</div>
      <div class="pwa-install-text">
        Safari 底部点“分享” → “添加到主屏幕”。
      </div>
      <div class="pwa-install-status" :class="{ ready: offlineReady }">
        {{ offlineReady ? '离线游戏已准备好' : '正在准备离线游戏…' }}
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.pwa-install-hint {
  position: fixed;
  z-index: 2147483000;
  left: max(12px, env(safe-area-inset-left));
  right: max(12px, env(safe-area-inset-right));
  bottom: calc(14px + env(safe-area-inset-bottom));
  margin: 0 auto;
  max-width: 480px;
  box-sizing: border-box;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 16px;
  padding: 14px 46px 13px 15px;
  background: rgba(8, 16, 44, .96);
  box-shadow: 0 12px 36px rgba(0,0,0,.38);
  color: #fff;
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}
.pwa-install-title {
  font-size: 16px;
  line-height: 1.25;
  font-weight: 800;
  margin-bottom: 5px;
}
.pwa-install-text {
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255,255,255,.86);
}
.pwa-install-status {
  display: inline-block;
  margin-top: 8px;
  font-size: 11px;
  color: #ffd166;
}
.pwa-install-status.ready {
  color: #7be7a7;
}
.pwa-install-close {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: rgba(255,255,255,.8);
  font-size: 26px;
  line-height: 34px;
  padding: 0;
}
.pwa-hint-enter-active, .pwa-hint-leave-active { transition: opacity .2s ease, transform .2s ease; }
.pwa-hint-enter-from, .pwa-hint-leave-to { opacity: 0; transform: translateY(12px); }
</style>
