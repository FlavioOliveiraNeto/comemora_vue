import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import api from '@/services/axiosConfig'

const app = createApp(App)

// Configurar axios globalmente
app.config.globalProperties.$api = api

app.config.productionTip = false;

// Configurar interceptors
api.interceptors.request.use(config => {
  const token = store.state.auth.token
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
}, error => {
  return Promise.reject(error)
})

app.use(router)
app.use(store)
app.mount('#app')