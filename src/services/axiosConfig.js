import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
  withCredentials: true
})

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    const cleanedToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    config.headers['Authorization'] = `Bearer ${cleanedToken}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Response interceptor
api.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  return Promise.reject(error)
})

export default api