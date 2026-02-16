import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiMail, FiArrowLeft } from 'react-icons/fi'
import api from '../services/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: enter emailOrUsername, 2: enter email, 3: success
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')
  const [resetLink, setResetLink] = useState('') // When server has no email config, we show this link

  const handleStep1Submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', {
        emailOrUsername: formData.emailOrUsername,
      })

      if (response.data.requiresEmail) {
        // User found, need to confirm email
        setMaskedEmail(response.data.maskedEmail)
        setStep(2)
      } else {
        // Email sent directly (shouldn't happen in this flow)
        setStep(3)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', {
        emailOrUsername: formData.emailOrUsername,
        email: formData.email,
      })
      if (response.data?.developmentMode && response.data?.resetLink) {
        setResetLink(response.data.resetLink)
      } else {
        setResetLink('')
      }
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (loading && step !== 3) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            {/* Step 1: Enter Email/Username */}
            {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                    <FiMail className="text-3xl text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-dark dark:text-white mb-2">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your email or username to reset your password
                  </p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={formData.emailOrUsername}
                      onChange={(e) =>
                        setFormData({ ...formData, emailOrUsername: e.target.value })
                      }
                      className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Enter your email or username"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary">
                    Continue
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
              </>
            )}

            {/* Step 2: Confirm Email */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                    <FiMail className="text-3xl text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-dark dark:text-white mb-2">
                    Confirm Your Email
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    We found an account. Please enter your registered email to receive the reset link.
                  </p>
                  {maskedEmail && (
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                      Hint: {maskedEmail}
                    </p>
                  )}
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary">
                    Send Reset Link
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-primary hover:underline flex items-center justify-center space-x-1 mx-auto"
                  >
                    <FiArrowLeft />
                    <span>Back</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <FiMail className="text-3xl text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-dark dark:text-white mb-2">
                  {resetLink ? 'Use This Link to Reset' : 'Check Your Email'}
                </h2>
                {resetLink ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Email is not configured on this server, so the reset link could not be sent to your inbox. Use the link below to reset your password (development only).
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                      The link expires in 1 hour.
                    </p>
                    <a
                      href={resetLink}
                      className="btn-primary inline-block mb-4"
                    >
                      Reset My Password
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all mb-6">
                      Or copy: {resetLink}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      We've sent a password reset link to your email address. Please check your inbox
                      and follow the instructions to reset your password.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
                      The reset link will expire in 1 hour.
                    </p>
                  </>
                )}
                <Link to="/login" className="btn-primary inline-block">
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
