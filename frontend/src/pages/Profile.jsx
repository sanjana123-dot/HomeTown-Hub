import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FiMapPin, FiMail, FiCalendar, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiHome, FiTrash2, FiLock } from 'react-icons/fi'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { INDIAN_STATES } from '../constants/indianStates'
import { isValidEmailFormat } from '../utils/emailValidation'

const Profile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser, updateProfile, deleteProfile, logout } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    hometown: '',
    city: '',
    state: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userRes, postsRes, communitiesRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/posts`),
          api.get(`/users/${id}/communities`),
        ])
        setProfileUser(userRes.data)
        setPosts(postsRes.data)
        setCommunities(communitiesRes.data)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [id])

  useEffect(() => {
    if (profileUser) {
      setFormData({
        name: profileUser.name || '',
        username: profileUser.username || '', // Empty string if no username
        email: profileUser.email || '',
        hometown: profileUser.hometown || '',
        city: profileUser.city || '',
        state: profileUser.state || '',
      })
    }
  }, [profileUser])

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

  const isOwnProfile = authUser && authUser._id === id

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validate username - required only if user doesn't have one yet
    const hasUsername = profileUser.username && profileUser.username.trim()
    const usernameProvided = formData.username && formData.username.trim()
    
    if (!hasUsername && !usernameProvided) {
      setErrors({ username: 'Username is required. Please set a username to continue.' })
      return
    }
    
    // If username is provided (either setting for first time or updating), validate it
    if (usernameProvided) {
      const usernameValidation = validateUsername(formData.username)
      if (usernameValidation) {
        setErrors({ username: usernameValidation })
        return
      }
    }

    // Validate email (required field)
    if (!formData.email || !formData.email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }
    
    if (!isValidEmailFormat(formData.email)) {
      setErrors({ email: 'Invalid email format' })
      return
    }

    try {
      // Build update data
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        hometown: formData.hometown?.trim() || '',
        city: formData.city?.trim() || '',
        state: formData.state || '',
      }
      
      // Always include username in the request if user doesn't have one (required)
      // Or include it if provided (for updating)
      if (!hasUsername || usernameProvided) {
        // Ensure username is included - if user doesn't have one, it must be provided (already validated above)
        if (usernameProvided) {
          updateData.username = formData.username.trim()
        } else {
          // This shouldn't happen due to validation above, but include empty string to trigger backend error
          updateData.username = ''
        }
      }
      
      console.log('Sending update data:', updateData) // Debug log
      
      const updated = await updateProfile(updateData)
      setProfileUser(updated)
      setIsEditing(false)
      setErrors({})
      
      // Show success message if username was set for the first time
      if (!hasUsername && usernameProvided) {
        alert('Username set successfully! Your profile has been updated.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update profile'
      
      // Set specific field errors if available
      if (errorMessage.toLowerCase().includes('username')) {
        setErrors({ username: errorMessage })
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage })
      } else {
        alert(errorMessage)
      }
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')

    // Validate password: minimum 8 characters
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setShowPasswordChange(false)
      alert('Password changed successfully!')
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      await deleteProfile()
      // Redirect to home page after successful deletion
      navigate('/')
      // Show success message
      alert('Your account has been permanently deleted.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert(error.response?.data?.message || 'Failed to delete account. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500 dark:text-gray-300">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {profileUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">{profileUser.name}</h1>
                      <div className="space-y-2 text-gray-600 dark:text-gray-300">
                        {profileUser.hometown && (
                          <div className="flex items-center">
                            <FiMapPin className="mr-2" />
                            <span>From {profileUser.hometown}, {profileUser.city}, {profileUser.state}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <FiMail className="mr-2" />
                          <span>{profileUser.email}</span>
                        </div>
                        {profileUser.username ? (
                          <div className="flex items-center">
                            <FiUsers className="mr-2" />
                            <span>@{profileUser.username}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <FiUsers className="mr-2" />
                            <span>No username set - Please set one in your profile</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <FiCalendar className="mr-2" />
                          <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {isOwnProfile && !isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-secondary ml-4"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isOwnProfile && isEditing && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username <span className="text-gray-500 dark:text-gray-400 text-xs">(unique)</span>
                            {!profileUser.username && (
                              <span className="text-yellow-600 dark:text-yellow-400 text-xs ml-2 font-semibold">*Required</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={formData.username || ''}
                            onChange={(e) => {
                              setFormData({ ...formData, username: e.target.value })
                              if (errors.username) setErrors({ ...errors, username: '' })
                            }}
                            className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                            placeholder="e.g., johndoe123"
                            required={!profileUser.username}
                          />
                          {!profileUser.username && (
                            <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1 font-medium">
                              ⚠ You need to set a username to continue using your account
                            </p>
                          )}
                          {errors.username && (
                            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.username}</p>
                          )}
                          {!errors.username && formData.username && validateUsername(formData.username) === '' && (
                            <p className="text-green-600 dark:text-green-400 text-xs mt-1">✓ Valid username</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value })
                            if (errors.email) setErrors({ ...errors, email: '' })
                          }}
                          className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="e.g., you@example.com"
                          required
                        />
                        {errors.email && (
                          <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>
                        )}
                        {!errors.email && formData.email && isValidEmailFormat(formData.email) && (
                          <p className="text-green-600 dark:text-green-400 text-xs mt-1">✓ Valid email</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hometown</label>
                          <input
                            type="text"
                            value={formData.hometown}
                            onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                            className="input-field"
                            placeholder="Your hometown name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
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
                      <div className="flex space-x-2">
                        <button type="submit" className="btn-primary">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setErrors({})
                            setFormData({
                              name: profileUser.name || '',
                              username: profileUser.username || '', // Empty string if no username
                              email: profileUser.email || '',
                              hometown: profileUser.hometown || '',
                              city: profileUser.city || '',
                              state: profileUser.state || '',
                            })
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Password Change Section */}
                  {isOwnProfile && !isEditing && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-dark dark:text-white mb-2 flex items-center gap-2">
                        <FiLock />
                        Change Password
                      </h3>
                      {!showPasswordChange ? (
                        <button
                          onClick={() => setShowPasswordChange(true)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          Change Password
                        </button>
                      ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-3 mt-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              New Password <span className="text-gray-500 dark:text-gray-400 text-xs">(minimum 8 characters)</span>
                            </label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => {
                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                                if (passwordError) setPasswordError('')
                              }}
                              className={`input-field ${passwordError && passwordError.includes('8 characters') ? 'border-red-500' : ''}`}
                              required
                              minLength={8}
                            />
                            {passwordData.newPassword && passwordData.newPassword.length > 0 && passwordData.newPassword.length < 8 && (
                              <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                                Password must be at least 8 characters ({passwordData.newPassword.length}/8)
                              </p>
                            )}
                            {passwordData.newPassword && passwordData.newPassword.length >= 8 && !passwordError && (
                              <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                                ✓ Password meets requirements
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => {
                                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                if (passwordError && passwordError.includes('match')) setPasswordError('')
                              }}
                              className={`input-field ${passwordError && passwordError.includes('match') ? 'border-red-500' : ''}`}
                              required
                              minLength={8}
                            />
                          </div>
                          {passwordError && (
                            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded font-semibold text-sm">
                              {passwordError}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <button type="submit" className="btn-primary">
                              Update Password
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswordChange(false)
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: '',
                                })
                                setPasswordError('')
                              }}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Delete Account Section */}
                  {isOwnProfile && !isEditing && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back. All your data including posts, comments, events, and communities will be permanently deleted.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={handleDeleteAccount}
                          className="btn-danger flex items-center gap-2"
                        >
                          <FiTrash2 />
                          Delete My Account
                        </button>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
                            Are you absolutely sure?
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                              className="btn-danger flex items-center gap-2"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false)
                                setIsDeleting(false)
                              }}
                              disabled={isDeleting}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Communities Created by User */}
            {isOwnProfile && communities.length > 0 && (
              <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
                <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white flex items-center">
                  <FiHome className="mr-2" />
                  My Communities ({communities.length})
                </h2>
                <div className="space-y-4">
                  {communities.map((community) => {
                    const getStatusBadge = () => {
                      switch (community.status) {
                        case 'approved':
                          return (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              <FiCheckCircle className="mr-1" />
                              Approved
                            </span>
                          )
                        case 'rejected':
                          return (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                              <FiXCircle className="mr-1" />
                              Rejected
                            </span>
                          )
                        case 'pending':
                        default:
                          return (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                              <FiClock className="mr-1" />
                              Pending Approval
                            </span>
                          )
                      }
                    }

                    const getStatusMessage = () => {
                      switch (community.status) {
                        case 'approved':
                          return (
                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                              ✓ Your community is approved! Other users can now join.
                            </p>
                          )
                        case 'rejected':
                          return (
                            <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                              ✗ Your community was rejected. Other users cannot join. Please contact platform admin for more information.
                            </p>
                          )
                        case 'pending':
                        default:
                          return (
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                              ⏳ Waiting for platform admin approval. Other users cannot join until approved.
                            </p>
                          )
                      }
                    }

                    return (
                      <div
                        key={community._id}
                        className="border dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-dark dark:text-white">
                                {community.name}
                              </h3>
                              {getStatusBadge()}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              {community.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-300">
                              <div className="flex items-center">
                                <FiMapPin className="mr-1" />
                                {community.city}, {community.state}
                              </div>
                              <div className="flex items-center">
                                <FiUsers className="mr-1" />
                                {community.memberCount || 0} Members
                              </div>
                              <div className="flex items-center">
                                <FiCalendar className="mr-1" />
                                Created {new Date(community.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {getStatusMessage()}
                          </div>
                          <button
                            onClick={() => navigate(`/community/${community._id}`)}
                            className="btn-secondary text-sm ml-4"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* User Posts */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white">Posts</h2>
              {posts.length === 0 ? (
                <div className="card text-center py-12 dark:bg-gray-900 dark:border-gray-800">
                  <p className="text-gray-500 dark:text-gray-300">No posts yet.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Profile






