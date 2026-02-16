import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Community from '../models/Community.js'
import Notification from '../models/Notification.js'
import { getFileType } from '../middleware/upload.js'

export const createPost = async (req, res) => {
  try {
    const { content, community } = req.body
    const files = []

    // Ensure user is allowed to post in this community
    const comm = await Community.findById(community).select(
      'members bannedMembers name'
    )
    if (!comm) {
      return res.status(404).json({ message: 'Community not found' })
    }

    const userId = req.user._id.toString()
    const isMember = comm.members.some((m) => m.toString() === userId)
    if (!isMember) {
      return res
        .status(403)
        .json({ message: 'You must be a member to post in this community' })
    }

    const isBanned =
      Array.isArray(comm.bannedMembers) &&
      comm.bannedMembers.some((m) => m.toString() === userId)
    if (isBanned) {
      return res
        .status(403)
        .json({ message: 'You are restricted from posting in this community' })
    }

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      // Parse captions from form data
      // FormData sends captions as captions[0], captions[1], etc.
      const captions = {}
      Object.keys(req.body).forEach((key) => {
        if (key.startsWith('captions[')) {
          const match = key.match(/captions\[(\d+)\]/)
          if (match) {
            const index = parseInt(match[1])
            const caption = req.body[key]
            if (caption && caption.trim()) {
              captions[index] = caption.trim()
            }
          }
        }
      })

      req.files.forEach((file, index) => {
        const fileType = getFileType(file.mimetype)
        const fileUrl = `/uploads/${file.filename}`
        
        // For backward compatibility, set image if it's an image
        let image = null
        if (fileType === 'image') {
          image = fileUrl
        }

        files.push({
          filename: file.filename,
          originalName: file.originalname,
          fileType: fileType,
          url: fileUrl,
          caption: captions[index] || null,
        })
      })
    }

    // Handle legacy image field from body (for backward compatibility)
    let image = req.body.image || null
    if (files.length > 0 && files[0].fileType === 'image') {
      image = files[0].url
    }

    // Handle legacy video field
    let video = null
    if (files.length > 0 && files[0].fileType === 'video') {
      video = files[0].url
    }

    const post = await Post.create({
      content,
      community,
      author: req.user._id,
      image,
      video,
      files,
    })

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('community', 'name')

    // Notify community members (except author) of new post
    try {
      if (comm?.members?.length) {
        const message = `${req.user.name} posted in ${populatedPost.community?.name || 'a community'}.`
        const notifications = comm.members
          .filter((m) => m.toString() !== req.user._id.toString())
          .map((memberId) => ({
            user: memberId,
            type: 'post',
            message,
            relatedId: post._id,
            relatedCommunityId: comm._id,
          }))
        if (notifications.length) await Notification.insertMany(notifications)
      }
    } catch (_) {
      /* ignore notification errors */
    }

    res.status(201).json(populatedPost)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFeed = async (req, res) => {
  try {
    const Community = (await import('../models/Community.js')).default
    const userCommunities = await Community.find({
      members: req.user._id,
      status: 'approved',
    }).select('_id')

    const communityIds = userCommunities.map((c) => c._id)

    const posts = await Post.find({ community: { $in: communityIds } })
      .populate('author', 'name username')
      .populate('community', 'name')
      .populate({
        path: 'comments',
        select: 'content author createdAt',
        populate: {
          path: 'author',
          select: 'name'
        },
        options: { limit: 5 } // Limit comments to reduce payload
      })
      .select('content author community image video files likes comments isPinned createdAt')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .lean() // Use lean() for faster queries (returns plain JS objects)

    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const isLiked = post.likes.includes(req.user._id)

    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      )
    } else {
      post.likes.push(req.user._id)
    }

    await post.save()

    res.json({ liked: !isLiked, likeCount: post.likes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { content } = req.body

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: req.params.id,
    })

    const post = await Post.findById(req.params.id).select('author community comments')
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Check membership / restriction in the post's community
    const community = await Community.findById(post.community).select(
      'members bannedMembers'
    )
    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    const userId = req.user._id.toString()
    const isMember = community.members.some((m) => m.toString() === userId)
    if (!isMember) {
      return res
        .status(403)
        .json({ message: 'You must be a member to comment in this community' })
    }

    const isBanned =
      Array.isArray(community.bannedMembers) &&
      community.bannedMembers.some((m) => m.toString() === userId)
    if (isBanned) {
      return res
        .status(403)
        .json({ message: 'You are restricted from commenting in this community' })
    }
    post.comments.push(comment._id)
    await post.save()

    // Notify post author of new comment (if not commenting on own post). relatedId = post so they can open that post.
    if (post.author && post.author.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          user: post.author,
          type: 'comment',
          message: `${req.user.name} commented on your post.`,
          relatedId: post._id,
          relatedCommunityId: post.community,
        })
      } catch (_) { /* ignore */ }
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name')

    res.status(201).json(populatedComment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const ensureCommunityAdminForPost = async (post, user) => {
  const community = await Community.findById(post.community).select(
    'creator moderators'
  )
  if (!community) return false

  const userId = user._id.toString()
  const isCreator = community.creator.toString() === userId
  const isModerator = community.moderators.some(
    (mod) => mod.toString() === userId
  )
  const isAdmin = user.role === 'admin'

  return isCreator || isModerator || isAdmin
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('author community')

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const userId = req.user._id.toString()
    const isAuthor = post.author.toString() === userId
    const isCommunityAdmin = await ensureCommunityAdminForPost(post, req.user)

    if (!isAuthor && !isCommunityAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    // Delete post and its comments
    await Comment.deleteMany({ post: post._id })
    await Post.deleteOne({ _id: post._id })

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const isCommunityAdmin = await ensureCommunityAdminForPost(post, req.user)
    if (!isCommunityAdmin) {
      return res.status(403).json({ message: 'Not authorized to pin posts' })
    }

    // Unpin other posts in this community
    await Post.updateMany(
      { community: post.community, _id: { $ne: post._id } },
      { $set: { isPinned: false } }
    )

    post.isPinned = true
    await post.save()

    res.json({ message: 'Post pinned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const unpinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const isCommunityAdmin = await ensureCommunityAdminForPost(post, req.user)
    if (!isCommunityAdmin) {
      return res.status(403).json({ message: 'Not authorized to unpin posts' })
    }

    post.isPinned = false
    await post.save()

    res.json({ message: 'Post unpinned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate(
      'post',
      'author community'
    )

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const userId = req.user._id.toString()
    const isAuthor = comment.author.toString() === userId

    // Community admin for the post
    const post = await Post.findById(comment.post._id).select(
      'author community'
    )
    const isCommunityAdmin = await ensureCommunityAdminForPost(post, req.user)

    if (!isAuthor && !isCommunityAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this comment' })
    }

    // Remove comment reference from post
    await Post.updateOne(
      { _id: post._id },
      { $pull: { comments: comment._id } }
    )

    await Comment.deleteOne({ _id: comment._id })

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



