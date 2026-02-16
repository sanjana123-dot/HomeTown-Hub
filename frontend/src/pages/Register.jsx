import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { INDIAN_STATES } from '../constants/indianStates'
import { isValidEmailFormat } from '../utils/emailValidation'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    hometown: '',
    city: '',
    state: '',
  })
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (username.length > 30) {
      return 'Username cannot exceed 30 characters'
    }
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      return 'Username can only contain lowercase letters, numbers, and underscores'
    }
    return ''
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value
    setFormData({ ...formData, username: value })
    
    if (value) {
      const validationError = validateUsername(value)
      setUsernameError(validationError)
    } else {
      setUsernameError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setUsernameError('')
    setEmailError('')
    setPasswordError('')
    
    // Validate username
    const usernameValidation = validateUsername(formData.username)
    if (usernameValidation) {
      setUsernameError(usernameValidation)
      return
    }

    // Validate email format
    if (!isValidEmailFormat(formData.email)) {
      setEmailError('Invalid email or email does not exist. Please use a real email address.')
      return
    }
    
    // Validate password: minimum 8 characters
    if (!formData.password || formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const response = await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        hometown: formData.hometown,
        city: formData.city,
        state: formData.state,
      })
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
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      
      // Check if it's a username error
      if (errorMessage.toLowerCase().includes('username')) {
        setUsernameError(errorMessage)
      }
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('valid')) {
        setEmailError(errorMessage)
      }
      // Check if it's a password error
      if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('8 characters')) {
        setPasswordError(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded font-semibold">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">
                  Username <span className="text-gray-600 dark:text-gray-300 text-sm">(unique)</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className={`input-field ${usernameError ? 'border-red-500' : ''}`}
                  placeholder="e.g., johndoe123"
                  required
                />
                {usernameError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">{usernameError}</p>
                )}
                {!usernameError && formData.username && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                    ✓ Username available (only lowercase letters, numbers, and underscores)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (emailError) setEmailError('')
                  }}
                  className={`input-field ${emailError ? 'border-red-500' : ''}`}
                  placeholder="e.g. you@example.com"
                  required
                />
                {emailError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">{emailError}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">
                  Password <span className="text-gray-600 dark:text-gray-300 text-sm">(minimum 8 characters)</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (passwordError) setPasswordError('')
                  }}
                  className={`input-field ${passwordError ? 'border-red-500' : ''}`}
                  minLength={8}
                  required
                />
                {passwordError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">{passwordError}</p>
                )}
                {!passwordError && formData.password && formData.password.length >= 8 && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                    ✓ Password meets requirements
                  </p>
                )}
                {!passwordError && formData.password && formData.password.length > 0 && formData.password.length < 8 && (
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                    Password must be at least 8 characters ({formData.password.length}/8)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (error && error.includes('match')) setError('')
                  }}
                  className={`input-field ${error && error.includes('match') ? 'border-red-500' : ''}`}
                  minLength={8}
                  required
                />
                {error && error.includes('match') && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">{error}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-bold mb-2">Hometown</label>
                <input
                  type="text"
                  value={formData.hometown}
                  onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                  className="input-field"
                  placeholder="Your hometown name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 dark:text-white font-bold mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-900 dark:text-white font-bold mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full btn-primary">
                Sign Up
              </button>
            </form>
            <p className="mt-4 text-center text-gray-700 dark:text-gray-300 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary dark:text-blue-400 font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register






