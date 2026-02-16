import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to handle file uploads and authentication
api.interceptors.request.use((config) => {
  // IMPORTANT: Don't send Authorization header for auth endpoints (login, register, password reset)
  // This prevents sending invalid/expired tokens that could cause 401 errors on login attempts
  // If you see 401 errors on login, check: 1) Credentials are correct, 2) User exists in DB, 3) Backend logs
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
  const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint))
  
  const token = localStorage.getItem('token')
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Don't set Content-Type for FormData, let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

export default api





