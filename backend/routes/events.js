import express from 'express'
import {
  createEvent,
  getEvent,
  getUpcomingEvents,
  getAllEvents,
  attendEvent,
  deleteEvent,
} from '../controllers/eventController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Specific routes first
router.post('/', protect, createEvent)
router.get('/all', protect, getAllEvents)
router.get('/upcoming', protect, getUpcomingEvents)

// Parameterized routes last
router.post('/:id/attend', protect, attendEvent)
router.delete('/:id', protect, deleteEvent)
router.get('/:id', protect, getEvent)

export default router



