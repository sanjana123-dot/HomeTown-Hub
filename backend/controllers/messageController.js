import Message from '../models/Message.js'
import Community from '../models/Community.js'
import User from '../models/User.js'

// Helper function to get file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('text')
  ) {
    return 'document'
  }
  return 'other'
}

// Send a message (optionally share a post: pass postId in body)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, communityId, content, postId } = req.body

    // Validate that both users are members of the community
    const community = await Community.findById(communityId)
    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    const senderId = req.user._id.toString()
    const isSenderMember =
      community.members.some((m) => m.toString() === senderId) ||
      community.creator.toString() === senderId
    const isReceiverMember =
      community.members.some((m) => m.toString() === receiverId) ||
      community.creator.toString() === receiverId

    if (!isSenderMember || !isReceiverMember) {
      return res
        .status(403)
        .json({ message: 'Both users must be members of the community' })
    }

    // Process uploaded files
    const files = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileType = getFileType(file.mimetype)
        const fileUrl = `/uploads/${file.filename}`

        files.push({
          filename: file.filename,
          originalName: file.originalname,
          fileType: fileType,
          url: fileUrl,
        })
      })
    }

    // Handle legacy image field
    let image = null
    if (files.length > 0 && files[0].fileType === 'image') {
      image = files[0].url
    }

    // Handle legacy video field
    let video = null
    if (files.length > 0 && files[0].fileType === 'video') {
      video = files[0].url
    }

    // Optional: share a post (must be in the same community)
    let sharedPost = null
    if (postId) {
      const Post = (await import('../models/Post.js')).default
      const post = await Post.findById(postId).select('community').lean()
      if (!post) {
        return res.status(404).json({ message: 'Post not found' })
      }
      if (post.community.toString() !== communityId) {
        return res.status(400).json({ message: 'Post must be from the same community' })
      }
      sharedPost = postId
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      community: communityId,
      content: content || (sharedPost ? 'Shared a post' : ''),
      image,
      video,
      files,
      sharedPost: sharedPost || undefined,
    })

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .populate('community', 'name')
      .populate({
        path: 'sharedPost',
        select: 'content image video files createdAt',
        populate: [
          { path: 'author', select: 'name' },
          { path: 'community', select: 'name' },
        ],
      })

    res.status(201).json(populatedMessage)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get conversation between two users in a community
export const getConversation = async (req, res) => {
  try {
    const { receiverId, communityId } = req.params
    const userId = req.user._id.toString()

    // Return messages between current user and the other participant (receiverId)
    const messages = await Message.find({
      community: communityId,
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .populate({
        path: 'sharedPost',
        select: 'content image video files createdAt',
        populate: [
          { path: 'author', select: 'name' },
          { path: 'community', select: 'name' },
        ],
      })
      .sort({ createdAt: 1 })

    // Mark messages as read
    await Message.updateMany(
      {
        sender: receiverId,
        receiver: userId,
        community: communityId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    )

    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all conversations for a user in a community
export const getConversations = async (req, res) => {
  try {
    const { communityId } = req.params
    const userId = req.user._id

    // Get all unique conversations (people user has messaged or received messages from)
    const messages = await Message.find({
      community: communityId,
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .sort({ createdAt: -1 })

    // Group by conversation partner
    const conversationsMap = new Map()

    messages.forEach((message) => {
      const partnerId =
        message.sender._id.toString() === userId.toString()
          ? message.receiver._id.toString()
          : message.sender._id.toString()

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner:
            message.sender._id.toString() === userId.toString()
              ? message.receiver
              : message.sender,
          lastMessage: message,
          unreadCount: 0,
        })
      }

      const conversation = conversationsMap.get(partnerId)
      if (
        message.receiver._id.toString() === userId.toString() &&
        !message.isRead
      ) {
        conversation.unreadCount++
      }
    })

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    )

    res.json(conversations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    })

    res.json({ unreadCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { senderId, communityId } = req.body

    await Message.updateMany(
      {
        sender: senderId,
        receiver: req.user._id,
        community: communityId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    )

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await Message.findByIdAndDelete(req.params.id)

    res.json({ message: 'Message deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
