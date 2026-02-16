import Community from '../models/Community.js'
import User from '../models/User.js'
import Post from '../models/Post.js'

export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCommunities,
      pendingCommunities,
      totalPosts,
      suspendedUsers,
      bannedUsers,
      totalModerators,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Community.countDocuments({ status: 'approved' }),
      Community.countDocuments({ status: 'pending' }),
      Post.countDocuments(),
      User.countDocuments({ isSuspended: true }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'moderator' }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ])

    res.json({
      totalUsers,
      totalCommunities,
      pendingCommunities,
      totalPosts,
      suspendedUsers,
      bannedUsers,
      totalModerators,
      recentUsers,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPendingCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: 'pending' })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })

    res.json(communities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all communities (for platform admin management)
export const getAllCommunities = async (req, res) => {
  try {
    const { status, search } = req.query
    const filter = {}
    
    if (status) {
      filter.status = status
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const communities = await Community.find(filter)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    res.json(communities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const approveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    community.status = 'approved'
    await community.save()

    res.json({ message: 'Community approved successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const rejectCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    community.status = 'rejected'
    await community.save()

    res.json({ message: 'Community rejected successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })

    res.json(admins)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create admin user (only existing admins can create new admins)
export const createAdmin = async (req, res) => {
  try {
    const { email, name, hometown, city, state } = req.body

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        return res.status(400).json({ message: 'User is already an admin' })
      }
      // Update existing user to admin
      existingUser.role = 'admin'
      await existingUser.save()
      return res.json({ 
        message: 'User updated to admin successfully',
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
        }
      })
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!'
    
    const admin = await User.create({
      name,
      email,
      password,
      hometown: hometown || 'Admin',
      city: city || 'Admin',
      state: state || 'Admin',
      role: 'admin',
    })

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      temporaryPassword: password,
      note: 'Share this temporary password securely. User should change it after first login.',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all users with filters
export const getUsers = async (req, res) => {
  try {
    const { search, role, isSuspended, isBanned, page = 1, limit = 20 } = req.query
    const filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    if (role) filter.role = role
    if (isSuspended === 'true') filter.isSuspended = true
    if (isBanned === 'true') filter.isBanned = true

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ])

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin users' })
    }

    user.isSuspended = true
    user.suspensionReason = reason || 'Suspended by platform admin'
    await user.save()

    res.json({ message: 'User suspended successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Unsuspend user
export const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isSuspended = false
    user.suspensionReason = undefined
    await user.save()

    res.json({ message: 'User unsuspended successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Ban user
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' })
    }

    user.isBanned = true
    user.banReason = reason || 'Banned by platform admin'
    await user.save()

    res.json({ message: 'User banned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Unban user
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isBanned = false
    user.banReason = undefined
    await user.save()

    res.json({ message: 'User unbanned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Assign moderator role to a user for a community
export const assignModerator = async (req, res) => {
  try {
    const { userId, communityId } = req.params

    const [user, community] = await Promise.all([
      User.findById(userId),
      Community.findById(communityId),
    ])

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (!community.moderators.includes(userId)) {
      community.moderators.push(userId)
      await community.save()
    }

    res.json({ message: 'Moderator assigned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Revoke moderator role from a user for a community
export const revokeModerator = async (req, res) => {
  try {
    const { userId, communityId } = req.params

    const community = await Community.findById(communityId)
    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    community.moderators = community.moderators.filter(
      (id) => id.toString() !== userId
    )
    await community.save()

    res.json({ message: 'Moderator role revoked successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete community (platform admin only) - with cascading deletes
export const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params

    const community = await Community.findById(communityId)
    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    // Import models needed for cascading deletes
    const Post = (await import('../models/Post.js')).default
    const Comment = (await import('../models/Comment.js')).default
    const Event = (await import('../models/Event.js')).default
    const Message = (await import('../models/Message.js')).default
    const Notification = (await import('../models/Notification.js')).default
    const Announcement = (await import('../models/Announcement.js')).default

    // 1. Delete all posts in this community and their comments
    const posts = await Post.find({ community: communityId })
    const postIds = posts.map(post => post._id)
    
    // Delete all comments on posts in this community
    await Comment.deleteMany({ post: { $in: postIds } })
    
    // Delete all posts in this community
    await Post.deleteMany({ community: communityId })

    // 2. Delete all events in this community
    await Event.deleteMany({ community: communityId })

    // 3. Delete all messages related to this community
    await Message.deleteMany({ community: communityId })

    // 4. Delete all notifications related to this community
    await Notification.deleteMany({ relatedCommunityId: communityId })

    // 5. Delete all announcements in this community
    await Announcement.deleteMany({ community: communityId })

    // 6. Finally, delete the community itself
    await Community.deleteOne({ _id: communityId })

    res.json({ message: 'Community deleted successfully. All associated data has been removed.' })
  } catch (error) {
    console.error('Error deleting community:', error)
    res.status(500).json({ message: error.message || 'Failed to delete community' })
  }
}
