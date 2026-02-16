import express from 'express'
import {
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  getMyCommunities,
  getMyAdminCommunities,
  getCommunityPosts,
  getCommunityEvents,
  approveMember,
  rejectMember,
  removeMember,
  updateCommunitySettings,
} from '../controllers/communityController.js'
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Specific routes first (before :id routes)
router.post('/', protect, createCommunity)
router.get('/my/admin', protect, getMyAdminCommunities)
router.get('/my', protect, getMyCommunities)
router.get('/', getCommunities)

// Parameterized routes last
router.patch('/:id/settings', protect, updateCommunitySettings)
router.post('/:id/requests/:userId/approve', protect, approveMember)
router.post('/:id/requests/:userId/reject', protect, rejectMember)
router.delete('/:id/members/:userId', protect, removeMember)
router.get('/:id/posts', protect, getCommunityPosts)
router.get('/:id/events', protect, getCommunityEvents)
router.get('/:id/announcements', protect, getAnnouncements)
router.post('/:id/announcements', protect, createAnnouncement)
router.post('/:id/join', protect, joinCommunity)
router.get('/:id', protect, getCommunity)

export default router



