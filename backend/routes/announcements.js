import express from 'express'
import {
  createAnnouncement,
  getAnnouncements,
  pinAnnouncement,
  unpinAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '../controllers/announcementController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Log all requests to this router (remove in production if noisy)
router.use((req, res, next) => {
  console.log(`[Announcements] ${req.method} ${req.originalUrl}`)
  next()
})

// So GET /api/announcements is handled (e.g. for debugging); create is POST
router.get('/', (req, res) => {
  res.status(405).json({ message: 'Use POST to create an announcement. List by community: GET /api/announcements/community/:communityId' })
})
router.post('/', protect, createAnnouncement)
router.get('/community/:communityId', protect, getAnnouncements)
router.put('/:id', protect, updateAnnouncement)
router.post('/:id/pin', protect, pinAnnouncement)
router.post('/:id/unpin', protect, unpinAnnouncement)
router.delete('/:id', protect, deleteAnnouncement)

export default router
