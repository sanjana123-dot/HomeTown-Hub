import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiLock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import api from '../services/api'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate password: minimum 8 characters
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', {
        token,
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
          <div className="max-w-md w-full">
            <div className="card dark:bg-gray-900 dark:border-gray-800 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <FiCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-dark dark:text-white mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
                Redirecting to login page...
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                <FiLock className="text-3xl text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-dark dark:text-white mb-2">
                Reset Your Password
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  New Password <span className="text-gray-600 dark:text-gray-400 text-sm">(minimum 8 characters)</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (error) setError('')
                  }}
                  className={`input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white ${error && error.includes('8 characters') ? 'border-red-500' : ''}`}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                {formData.password && formData.password.length > 0 && formData.password.length < 8 && (
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                    Password must be at least 8 characters ({formData.password.length}/8)
                  </p>
                )}
                {formData.password && formData.password.length >= 8 && !error && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    ✓ Password meets requirements
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (error && error.includes('match')) setError('')
                  }}
                  className={`input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white ${error && error.includes('match') ? 'border-red-500' : ''}`}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-primary hover:underline flex items-center justify-center space-x-1"
              >
                <FiArrowLeft />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
