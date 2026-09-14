import { createApp } from 'vue'
import './style.css'
import './game-styles.css'
import './animations.css'
import App from './App.vue'
// v0.6.0: phone layout must load AFTER App/component scoped styles.
// Legacy mobile layout layers were removed; mobile-handfeel.css is the single phone layout layer.
import './mobile-handfeel.css'
import { installMobileTouchFeedback } from './utils/mobileTouch.js'
import { registerPwaServiceWorker } from './utils/pwa.js'

installMobileTouchFeedback()
createApp(App).mount('#app')
registerPwaServiceWorker()
