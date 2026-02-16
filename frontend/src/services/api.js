import axios from 'axios'

// Use environment variable for production, fallback to '/api' for development
// If VITE_API_URL is set, ensure it ends with /api (or add it)
let apiBaseURL = import.meta.env.VITE_API_URL || '/api'

// If VITE_API_URL is provided (production), ensure it ends with /api
if (import.meta.env.VITE_API_URL) {
  // Remove trailing slash if present
  apiBaseURL = import.meta.env.VITE_API_URL.replace(/\/$/, '')
  // Add /api if not already present
  if (!apiBaseURL.endsWith('/api')) {
    apiBaseURL = apiBaseURL + '/api'
  }
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
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
    // Increase timeout for file uploads
    config.timeout = 30000 // 30 seconds for file uploads
  }
  
  return config
})

// Add response interceptor for error handling and performance monitoring
api.interceptors.response.use(
  (response) => {
    // Success - return response as is
    return response
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message === 'timeout of 10000ms exceeded') {
      console.error('Request timeout - the server took too long to respond')
      return Promise.reject(new Error('Request timeout. Please try again.'))
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - check your internet connection')
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }
    
    return Promise.reject(error)
  }
)

export default api





