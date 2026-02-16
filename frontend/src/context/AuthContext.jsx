import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (emailOrUsername, password) => {
    const response = await api.post('/auth/login', { emailOrUsername, password })
    const { token, user } = response.data
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return response.data
  }

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateProfile = async (updates) => {
    const response = await api.put('/users/me', updates)
    setUser(response.data)
    return response.data
  }

  const deleteProfile = async () => {
    try {
      await api.delete('/users/me')
      // Clear local storage and user state
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      return { success: true }
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    deleteProfile,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}






