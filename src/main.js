import { createApp } from 'vue'
import './style.css'
import './game-styles.css'
import './animations.css'
import './responsive.css'
import './mobile-app.css'
import './mobile-handfeel.css'
import App from './App.vue'
import { installMobileTouchFeedback } from './utils/mobileTouch.js'
import { registerPwaServiceWorker } from './utils/pwa.js'

installMobileTouchFeedback()
createApp(App).mount('#app')
registerPwaServiceWorker()
