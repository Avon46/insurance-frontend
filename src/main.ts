import './assets/theme.css'
import 'quasar/dist/quasar.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {},
  config: {
    brand: {
      primary: '#05994d',
      secondary: '#007a3d',
      negative: '#c0392b',
    },
  },
})

app.mount('#app')
