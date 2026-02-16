import Announcement from '../models/Announcement.js'
import Community from '../models/Community.js'
import Notification from '../models/Notification.js'

// Helper function to check if user is community admin
const ensureCommunityAdmin = async (communityId, user) => {
  const community = await Community.findById(communityId).select(
    'creator moderators'
  )
  if (!community) return false

  const userId = user._id.toString()
  const isCreator = community.creator.toString() === userId
  const isModerator = community.moderators.some(
    (mod) => mod.toString() === userId
  )
  const isPlatformAdmin = user.role === 'admin'

  return isCreator || isModerator || isPlatformAdmin
}

// Create announcement (users and admins can create). communityId from body or params.
export const createAnnouncement = async (req, res) => {
  try {
    const communityId = req.params.id || req.body.communityId || req.params.communityId
    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' })
    }
    if (!communityId) {
      return res.status(400).json({ message: 'Community is required. Use POST /api/communities/:id/announcements or send communityId in the body.' })
    }

    // Check if user is a member of the community
    const community = await Community.findById(communityId).select('members bannedMembers')
    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    const userId = req.user._id.toString()
    const isMember = community.members.some((m) => m.toString() === userId)
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to create announcements' })
    }

    const isBanned = Array.isArray(community.bannedMembers) &&
      community.bannedMembers.some((m) => m.toString() === userId)
    if (isBanned) {
      return res.status(403).json({ message: 'You are restricted from creating announcements' })
    }

    const announcement = await Announcement.create({
      title,
      content,
      author: req.user._id,
      community: communityId,
    })

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'name username')
      .populate('community', 'name')

    // Notify community members (except author) of new announcement
    try {
      const membersToNotify = community.members.filter(
        (memberId) => memberId.toString() !== userId
      )

      const notifications = membersToNotify.map((memberId) => ({
        user: memberId,
        type: 'announcement',
        message: `New announcement in ${populatedAnnouncement.community.name}: ${title}`,
        relatedId: announcement._id,
        relatedCommunityId: community._id,
      }))

      await Notification.insertMany(notifications)
    } catch (err) {
      console.error('Error creating notifications:', err)
    }

    res.status(201).json(populatedAnnouncement)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all announcements for a community (pinned first, then by date). communityId from params (id or communityId).
export const getAnnouncements = async (req, res) => {
  try {
    const communityId = req.params.communityId || req.params.id

    const announcements = await Announcement.find({ community: communityId })
      .populate('author', 'name username')
      .populate('community', 'name')
      .sort({ isPinned: -1, createdAt: -1 }) // Pinned first, then newest first

    res.json(announcements)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Pin announcement (admin only)
export const pinAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('community', 'creator moderators')

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    const isAdmin = await ensureCommunityAdmin(announcement.community._id, req.user)
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only community admins can pin announcements' })
    }

    // Unpin other announcements in this community
    await Announcement.updateMany(
      { community: announcement.community._id, _id: { $ne: announcement._id } },
      { isPinned: false, pinnedAt: null }
    )

    announcement.isPinned = true
    announcement.pinnedAt = new Date()
    await announcement.save()

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name username')
      .populate('community', 'name')

    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Unpin announcement (admin only)
export const unpinAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('community', 'creator moderators')

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    const isAdmin = await ensureCommunityAdmin(announcement.community._id, req.user)
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only community admins can unpin announcements' })
    }

    announcement.isPinned = false
    announcement.pinnedAt = null
    await announcement.save()

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name username')
      .populate('community', 'name')

    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete announcement (author or admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('community', 'creator moderators')

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    const userId = req.user._id.toString()
    const isAuthor = announcement.author.toString() === userId
    const isAdmin = await ensureCommunityAdmin(announcement.community._id, req.user)

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' })
    }

    await Announcement.deleteOne({ _id: announcement._id })

    res.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update announcement (author only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    const userId = req.user._id.toString()
    if (announcement.author.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own announcements' })
    }

    if (title) announcement.title = title
    if (content) announcement.content = content
    await announcement.save()

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name username')
      .populate('community', 'name')

    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
