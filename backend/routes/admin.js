import express from 'express'
import {
  getStats,
  getPendingCommunities,
  getAllCommunities,
  approveCommunity,
  rejectCommunity,
  getAdmins,
  createAdmin,
  getUsers,
  suspendUser,
  unsuspendUser,
  banUser,
  unbanUser,
  assignModerator,
  revokeModerator,
  deleteCommunity,
} from '../controllers/adminController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, admin)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.get('/communities/pending', getPendingCommunities)
router.get('/communities/all', getAllCommunities)
router.put('/communities/:id/approve', approveCommunity)
router.put('/communities/:id/reject', rejectCommunity)
router.delete('/communities/:communityId', deleteCommunity)
router.get('/admins', getAdmins)
router.post('/admins', createAdmin)
router.put('/users/:userId/suspend', suspendUser)
router.put('/users/:userId/unsuspend', unsuspendUser)
router.put('/users/:userId/ban', banUser)
router.put('/users/:userId/unban', unbanUser)
router.post('/communities/:communityId/moderators/:userId', assignModerator)
router.delete('/communities/:communityId/moderators/:userId', revokeModerator)

export default router





