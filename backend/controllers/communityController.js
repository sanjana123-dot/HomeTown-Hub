import Community from '../models/Community.js'
import User from '../models/User.js'

export const createCommunity = async (req, res) => {
  try {
    const { name, description, city, state, rules, requiresApproval } = req.body

    // Auto-approve if creator is a platform admin
    const status = req.user.role === 'admin' ? 'approved' : 'pending'

    const community = await Community.create({
      name,
      description,
      city,
      state,
      creator: req.user._id,
      members: [req.user._id],
      rules,
      status,
      requiresApproval: !!requiresApproval,
    })

    res.status(201).json(community)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunities = async (req, res) => {
  try {
    const { city, state, search } = req.query
    const filter = { status: 'approved' }

    if (city) filter.city = city
    if (state) filter.state = state
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const communities = await Community.find(filter)
      .populate('creator', 'name')
      .sort({ createdAt: -1 })

    res.json(communities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name username avatar')
      .populate('members', 'name username avatar')
      .populate('pendingMembers', 'name email username')

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    const userId = req.user._id.toString()
    const isMember = community.members.some(
      (member) => member._id.toString() === userId
    )
    const isPending = community.pendingMembers.some(
      (member) => member._id.toString() === userId
    )
    const isCreator =
      community.creator && community.creator._id.toString() === userId
    const isModerator = community.moderators.some(
      (mod) => mod.toString() === userId
    )

    const isCommunityAdmin =
      isCreator || isModerator || req.user.role === 'admin'

    const data = {
      ...community.toObject(),
      isMember,
      isPending,
      isCommunityAdmin,
    }

    // Only expose pendingMembers list to community admins
    if (!isCommunityAdmin) {
      delete data.pendingMembers
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (community.status !== 'approved') {
      return res.status(400).json({ message: 'Community is not approved yet' })
    }

    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' })
    }

    // If this community requires approval, add to pendingMembers instead
    if (community.requiresApproval) {
      if (community.pendingMembers.includes(req.user._id)) {
        return res
          .status(400)
          .json({ message: 'Join request is already pending' })
      }

      community.pendingMembers.push(req.user._id)
      await community.save()

      return res.json({ message: 'Join request sent and pending approval' })
    }

    // Otherwise, join immediately
    community.members.push(req.user._id)
    await community.save()

    res.json({ message: 'Joined community successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMyCommunities = async (req, res) => {
  try {
    // Get communities where user is a member AND status is approved
    // OR communities created by the user (to show pending ones they created)
    const communities = await Community.find({
      $or: [
        { members: req.user._id, status: 'approved' },
        { creator: req.user._id }
      ]
    })
      .populate('creator', 'name')
      .sort({ createdAt: -1 })

    res.json(communities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get communities where user is a community admin (creator or moderator)
export const getMyAdminCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      $or: [
        { creator: req.user._id },
        { moderators: req.user._id }
      ]
    })
      .populate('creator', 'name email')
      .populate('moderators', 'name email')
      .populate('members', 'name')
      .populate('pendingMembers', 'name email')
      .sort({ createdAt: -1 })

    // Add admin status for each community
    const communitiesWithAdminStatus = communities.map((comm) => {
      const userId = req.user._id.toString()
      const isCreator = comm.creator._id.toString() === userId
      const isModerator = comm.moderators.some(
        (mod) => mod._id.toString() === userId
      )

      return {
        ...comm.toObject(),
        adminRole: isCreator ? 'creator' : isModerator ? 'moderator' : null,
      }
    })

    res.json(communitiesWithAdminStatus)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunityPosts = async (req, res) => {
  try {
    const Post = (await import('../models/Post.js')).default
    const posts = await Post.find({ community: req.params.id })
      .populate('author', 'name')
      .populate('community', 'name')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .sort({ isPinned: -1, createdAt: -1 })

    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunityEvents = async (req, res) => {
  try {
    const Event = (await import('../models/Event.js')).default
    const events = await Event.find({ community: req.params.id })
      .populate('creator', 'name')
      .populate('attendees', 'name')
      .sort({ date: 1 })

    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// --- Admin-only member management helpers ---

const ensureCommunityAdmin = (community, user) => {
  const userId = user._id.toString()
  const isCreator =
    community.creator && community.creator.toString() === userId
  const isModerator = community.moderators.some(
    (mod) => mod.toString() === userId
  )
  const isAdmin = user.role === 'admin'

  return isCreator || isModerator || isAdmin
}

export const approveMember = async (req, res) => {
  try {
    const { id, userId } = req.params
    const community = await Community.findById(id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (!ensureCommunityAdmin(community, req.user)) {
      return res.status(403).json({ message: 'Not authorized to approve members' })
    }

    if (!community.pendingMembers.includes(userId)) {
      return res
        .status(400)
        .json({ message: 'User does not have a pending request' })
    }

    community.pendingMembers = community.pendingMembers.filter(
      (m) => m.toString() !== userId
    )

    if (!community.members.includes(userId)) {
      community.members.push(userId)
    }

    await community.save()

    res.json({ message: 'Member approved successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const rejectMember = async (req, res) => {
  try {
    const { id, userId } = req.params
    const community = await Community.findById(id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (!ensureCommunityAdmin(community, req.user)) {
      return res.status(403).json({ message: 'Not authorized to reject members' })
    }

    if (!community.pendingMembers.includes(userId)) {
      return res
        .status(400)
        .json({ message: 'User does not have a pending request' })
    }

    community.pendingMembers = community.pendingMembers.filter(
      (m) => m.toString() !== userId
    )

    await community.save()

    res.json({ message: 'Join request rejected' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params
    const community = await Community.findById(id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (!ensureCommunityAdmin(community, req.user)) {
      return res.status(403).json({ message: 'Not authorized to remove members' })
    }

    // Prevent removing the creator
    if (community.creator.toString() === userId) {
      return res
        .status(400)
        .json({ message: 'Cannot remove the community creator' })
    }

    community.members = community.members.filter(
      (m) => m.toString() !== userId
    )

    await community.save()

    res.json({ message: 'Member removed from community' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateCommunitySettings = async (req, res) => {
  try {
    const { id } = req.params
    const { rules, requiresApproval } = req.body

    const community = await Community.findById(id)

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (!ensureCommunityAdmin(community, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update settings' })
    }

    if (typeof rules === 'string') {
      community.rules = rules
    }

    if (typeof requiresApproval === 'boolean') {
      community.requiresApproval = requiresApproval
    }

    await community.save()

    res.json(community)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



