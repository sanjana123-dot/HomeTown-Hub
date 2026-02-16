import express from 'express'
import {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markAsRead,
  deleteMessage,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/', protect, upload.array('files', 10), sendMessage)
router.get('/community/:communityId/conversations', protect, getConversations)
router.get('/community/:communityId/conversation/:receiverId', protect, getConversation)
router.get('/unread-count', protect, getUnreadCount)
router.post('/mark-read', protect, markAsRead)
router.delete('/:id', protect, deleteMessage)

export default router
