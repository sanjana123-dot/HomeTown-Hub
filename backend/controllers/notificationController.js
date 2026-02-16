import Notification from '../models/Notification.js'
import Announcement from '../models/Announcement.js'

export const getMyNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // For announcement notifications missing relatedCommunityId (e.g. created before we added it),
    // look up the announcement to get the community id so the frontend can redirect correctly.
    const announcementNotifs = notifications.filter(
      (n) => n.type === 'announcement' && n.relatedId && !n.relatedCommunityId
    )
    if (announcementNotifs.length > 0) {
      const announcementIds = announcementNotifs.map((n) => n.relatedId)
      const announcements = await Announcement.find({ _id: { $in: announcementIds } })
        .select('_id community')
        .lean()
      const idToCommunity = Object.fromEntries(
        announcements.map((a) => [a._id.toString(), a.community?.toString()])
      )
      notifications = notifications.map((n) => {
        if (n.type === 'announcement' && n.relatedId && !n.relatedCommunityId) {
          const communityId = idToCommunity[n.relatedId.toString()]
          return { ...n, relatedCommunityId: communityId || n.relatedCommunityId }
        }
        return n
      })
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    })

    res.json({ notifications, unreadCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    notification.isRead = true
    await notification.save()
    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
