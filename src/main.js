import './assets/main.css'
import './assets/theme.css'
import '@fontsource/ibm-plex-sans-thai/400.css'
import '@fontsource/ibm-plex-sans-thai/500.css'
import '@fontsource/ibm-plex-sans-thai/600.css'

import { createApp } from 'vue'
import App from './app/App.vue'
import router from './app/router/index.js'

const app = createApp(App)

app.use(router)

app.mount('#app')
