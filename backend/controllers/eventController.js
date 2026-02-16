import Event from '../models/Event.js'
import Community from '../models/Community.js'
import Notification from '../models/Notification.js'

const ensureCommunityAdminForEvent = async (event, user) => {
  const community = await Community.findById(event.community).select(
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

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, community } = req.body

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      community,
      creator: req.user._id,
    })

    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'name')
      .populate('community', 'name')

    // Notify community members (except creator) of new event
    try {
      const comm = await Community.findById(community).select('members name')
      if (comm?.members?.length) {
        const message = `New event: "${title}" in ${populatedEvent.community?.name || 'your community'}.`
        const notifications = comm.members
          .filter((m) => m.toString() !== req.user._id.toString())
          .map((memberId) => ({
            user: memberId,
            type: 'event',
            message,
            relatedId: event._id,
            relatedCommunityId: comm._id,
          }))
        if (notifications.length) await Notification.insertMany(notifications)
      }
    } catch (_) { /* ignore */ }

    res.status(201).json(populatedEvent)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name')
      .populate('community', 'name')
      .populate('attendees', 'name')

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUpcomingEvents = async (req, res) => {
  try {
    const Community = (await import('../models/Community.js')).default
    // Get communities where user is a member AND status is approved
    // OR communities created by the user (to show events from pending communities they created)
    const userCommunities = await Community.find({
      $or: [
        { members: req.user._id, status: 'approved' },
        { creator: req.user._id }
      ]
    }).select('_id').lean()

    const communityIds = userCommunities.map((c) => c._id)

    // Get today's date at midnight for proper date comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find upcoming events (date >= today) from user's communities
    // Don't filter by status since date is the primary indicator
    const events = await Event.find({
      community: { $in: communityIds },
      date: { $gte: today },
    })
      .populate('creator', 'name username')
      .populate('community', 'name')
      .populate('attendees', 'name username')
      .select('title description date time location community creator attendees createdAt')
      .sort({ date: 1 })
      .limit(10)
      .lean() // Use lean() for faster queries

    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllEvents = async (req, res) => {
  try {
    const Community = (await import('../models/Community.js')).default
    const userCommunities = await Community.find({
      $or: [
        { members: req.user._id, status: 'approved' },
        { creator: req.user._id }
      ]
    }).select('_id').lean()

    const communityIds = userCommunities.map((c) => c._id)

    const events = await Event.find({
      community: { $in: communityIds },
    })
      .populate('creator', 'name username')
      .populate('community', 'name')
      .populate('attendees', 'name username')
      .select('title description date time location community creator attendees createdAt')
      .sort({ date: 1 })
      .lean() // Use lean() for faster queries

    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const isAttending = event.attendees.includes(req.user._id)

    if (isAttending) {
      event.attendees = event.attendees.filter(
        (id) => id.toString() !== req.user._id.toString()
      )
    } else {
      event.attendees.push(req.user._id)
    }

    await event.save()

    res.json({ message: isAttending ? 'Left event' : 'Joined event' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const isCommunityAdmin = await ensureCommunityAdminForEvent(event, req.user)
    const isCreator = event.creator.toString() === req.user._id.toString()

    if (!isCreator && !isCommunityAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' })
    }

    await Event.deleteOne({ _id: event._id })

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}





