import express from 'express'
import { protect } from '../middleware/auth.js'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Community from '../models/Community.js'
import Comment from '../models/Comment.js'
import Event from '../models/Event.js'
import Message from '../models/Message.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// Email validation helper
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/

function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length > 254 || trimmed.length < 8) return false
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false
  const domainPart = trimmed.slice(atIndex + 1)
  if (!domainPart.includes('.') || domainPart.length < 4) return false
  return EMAIL_REGEX.test(trimmed)
}

// Update current user's profile
router.put('/me', protect, async (req, res) => {
  try {
    console.log('=== PROFILE UPDATE REQUEST START ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    console.log('User ID from token:', req.user._id)
    
    const user = await User.findById(req.user._id)

    if (!user) {
      console.error('User not found in database')
      return res.status(404).json({ message: 'User not found' })
    }

    console.log('User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      hasUsername: !!user.username
    })

    const { name, username, email, hometown, city, state } = req.body

    // Debug logging (remove in production)
    console.log('Update request data:', { 
      userId: user._id, 
      hasUsername: !!user.username, 
      usernameProvided: username !== undefined,
      usernameValue: username,
      name,
      email,
      hometown,
      city,
      state
    })

    // Update name
    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim()
    }

    // Update username (with validation and uniqueness check)
    // Handle users who registered before username was required
    const userNeedsUsername = !user.username || (typeof user.username === 'string' && !user.username.trim())
    
    if (username !== undefined && username !== null) {
      // If username is provided as a non-empty string
      if (typeof username === 'string' && username.trim()) {
        const trimmedUsername = username.trim()
        
        // Validate username format (before lowercasing)
        if (trimmedUsername.length < 3) {
          return res.status(400).json({ message: 'Username must be at least 3 characters' })
        }
        if (trimmedUsername.length > 30) {
          return res.status(400).json({ message: 'Username cannot exceed 30 characters' })
        }
        // Check format (allow both cases, Mongoose will lowercase)
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
          return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' })
        }

        // Mongoose will automatically lowercase due to schema setting
        // But we need lowercase for comparison
        const normalizedUsername = trimmedUsername.toLowerCase()
        
        // Get current username for comparison (handle null/undefined)
        const currentUsername = (user.username && typeof user.username === 'string' && user.username.trim()) 
          ? user.username.toLowerCase().trim() 
          : null
        
        // Check if username is already taken by another user (only if different from current)
        if (normalizedUsername !== currentUsername) {
          const usernameExists = await User.findOne({ username: normalizedUsername })
          if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' })
          }
        }
        
        // Set the username (Mongoose will automatically lowercase it due to schema)
        // But we set it as lowercase to be safe
        user.username = normalizedUsername
        console.log('Username set to:', normalizedUsername) // Debug log
      } else {
        // Username is empty/whitespace
        // If user doesn't have a username, they must provide one
        if (userNeedsUsername) {
          return res.status(400).json({ message: 'Username is required. Please set a username to continue.' })
        }
        // If user already has a username and sends empty, keep existing (don't update)
      }
    } else {
      // Username not provided in request
      // If user doesn't have a username, they must provide one
      if (userNeedsUsername) {
        return res.status(400).json({ message: 'Username is required. Please set a username to continue.' })
      }
      // If user already has a username and it's not in request, keep existing
    }

    // Update email (with validation and uniqueness check)
    // Email is required, so we must validate it if provided
    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'Email is required and cannot be empty' })
      }
      
      const normalizedEmail = email.toLowerCase().trim()
      
      // Validate email format
      if (!isValidEmailFormat(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format' })
      }

      // Check if email is already taken by another user
      if (normalizedEmail !== user.email) {
        const emailExists = await User.findOne({ email: normalizedEmail })
        if (emailExists) {
          return res.status(400).json({ message: 'Email already exists' })
        }
        user.email = normalizedEmail
      }
    }

    // Update location fields (ensure they're not empty strings as they're required)
    if (typeof hometown === 'string' && hometown.trim()) {
      user.hometown = hometown.trim()
    } else if (hometown === undefined && !user.hometown) {
      return res.status(400).json({ message: 'Hometown is required' })
    }
    
    if (typeof city === 'string' && city.trim()) {
      user.city = city.trim()
    } else if (city === undefined && !user.city) {
      return res.status(400).json({ message: 'City is required' })
    }
    
    if (typeof state === 'string' && state.trim()) {
      user.state = state.trim()
    } else if (state === undefined && !user.state) {
      return res.status(400).json({ message: 'State is required' })
    }

    // Ensure all required fields are present before saving
    if (!user.email || (typeof user.email === 'string' && !user.email.trim())) {
      return res.status(400).json({ message: 'Email is required' })
    }
    
    if (!user.username || (typeof user.username === 'string' && !user.username.trim())) {
      console.error('Username validation failed - username is missing!') // Debug log
      return res.status(400).json({ message: 'Username is required. Please set a username to continue.' })
    }
    
    if (!user.hometown || (typeof user.hometown === 'string' && !user.hometown.trim())) {
      return res.status(400).json({ message: 'Hometown is required' })
    }
    
    if (!user.city || (typeof user.city === 'string' && !user.city.trim())) {
      return res.status(400).json({ message: 'City is required' })
    }
    
    if (!user.state || (typeof user.state === 'string' && !user.state.trim())) {
      return res.status(400).json({ message: 'State is required' })
    }
    
    console.log('Before save - user data:', {
      username: user.username,
      email: user.email,
      hometown: user.hometown,
      city: user.city,
      state: user.state,
      name: user.name
    }) // Debug log

    // Mark fields as modified to ensure they're saved
    if (user.isModified('username')) {
      user.markModified('username')
    }
    if (user.isModified('email')) {
      user.markModified('email')
    }

    // Save the user (Mongoose will validate automatically)
    const savedUser = await user.save()
    console.log('User saved successfully, ID:', savedUser._id) // Debug log

    const updatedUser = await User.findById(user._id).select('-password')
    console.log('=== PROFILE UPDATE SUCCESS ===')
    res.json(updatedUser)
  } catch (error) {
    console.log('=== PROFILE UPDATE ERROR ===')
    // Handle duplicate key errors (unique constraint violations)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      console.error('Duplicate key error:', field)
      return res.status(400).json({ message: `${field} already exists` })
    }
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error)
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        message: validationErrors.join(', ') || 'Validation failed',
        errors: validationErrors
      })
    }
    
    // Log the full error for debugging
    console.error('Error updating user profile:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    if (error.errors) {
      console.error('Error errors:', error.errors)
    }
    
    // Return a proper error response
    res.status(500).json({ 
      message: error.message || 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      errorName: error.name,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        errors: error.errors
      } : undefined
    })
  }
})

// Change password endpoint
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current password and new password' })
    }

    // Password validation: minimum 8 characters (can be letters, numbers, or symbols)
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user profile by id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get posts for a user
router.get('/:id/posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'name')
      .populate('community', 'name')
      .populate('comments')
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get communities created by a user
router.get('/:id/communities', protect, async (req, res) => {
  try {
    const communities = await Community.find({ creator: req.params.id })
      .populate('creator', 'name email')
      .select('name description city state status createdAt memberCount')
      .sort({ createdAt: -1 })

    res.json(communities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete current user's profile (complete account deletion)
router.delete('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id

    // 1. Delete all user's posts and their comments
    const userPosts = await Post.find({ author: userId })
    const postIds = userPosts.map(post => post._id)
    
    // Delete all comments on user's posts
    await Comment.deleteMany({ post: { $in: postIds } })
    
    // Delete all comments made by the user
    await Comment.deleteMany({ author: userId })
    
    // Remove user from likes arrays in posts
    await Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    )
    
    // Delete user's posts
    await Post.deleteMany({ author: userId })

    // 2. Delete all events created by user
    await Event.deleteMany({ creator: userId })
    
    // Remove user from event attendees
    await Event.updateMany(
      { attendees: userId },
      { $pull: { attendees: userId } }
    )

    // 3. Delete all messages sent or received by user
    await Message.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })

    // 4. Handle communities
    // Remove user from all communities (as member, moderator, pending, banned)
    await Community.updateMany(
      {},
      {
        $pull: {
          members: userId,
          moderators: userId,
          pendingMembers: userId,
          bannedMembers: userId
        }
      }
    )
    
    // Delete communities created by user (or you could transfer ownership - deleting for now)
    await Community.deleteMany({ creator: userId })

    // 5. Delete all notifications for the user
    await Notification.deleteMany({ user: userId })
    
    // Also delete notifications where user is referenced (e.g., someone liked their post)
    // This is optional but keeps the database clean

    // 6. Finally, delete the user
    await User.findByIdAndDelete(userId)

    res.json({ 
      message: 'Account deleted successfully. All your data has been permanently removed.' 
    })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({ 
      message: 'Failed to delete account. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router






