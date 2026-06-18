import './assets/theme.css'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify },
  config: {
    brand: {
      primary: '#05994d',
      secondary: '#007a3d',
      negative: '#c0392b',
    },
  },
})

app.mount('#app')
