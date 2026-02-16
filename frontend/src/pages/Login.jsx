import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../services/api'

const Login = () => {
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await login(formData.emailOrUsername, formData.password)
      const user = response.user
      
      // Check if user has city and navigate to suggested communities
      if (user?.city) {
        try {
          const communitiesResponse = await api.get(`/communities?city=${encodeURIComponent(user.city)}`)
          if (communitiesResponse.data && communitiesResponse.data.length > 0) {
            navigate('/suggested-communities')
            return
          }
        } catch (err) {
          // If error fetching communities, just go to dashboard
          console.error('Error fetching communities:', err)
        }
      }
      
      // No matching communities or no city, go to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Welcome Back</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded font-semibold">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">Email or Username</label>
                <input
                  type="text"
                  value={formData.emailOrUsername}
                  onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                  className="input-field"
                  placeholder="Enter your email or username"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-900 dark:text-white font-bold">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary dark:text-blue-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" className="w-full btn-primary">
                Login
              </button>
            </form>
            <p className="mt-4 text-center text-gray-700 dark:text-gray-300 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary dark:text-blue-400 font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login






