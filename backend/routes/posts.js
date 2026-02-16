import express from 'express'
import {
  createPost,
  getFeed,
  likePost,
  addComment,
  deletePost,
  pinPost,
  unpinPost,
  deleteComment,
} from '../controllers/postController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.post('/', protect, upload.array('files', 10), createPost)
router.get('/feed', protect, getFeed)
router.post('/:id/like', protect, likePost)
router.post('/:id/comments', protect, addComment)
router.delete('/:id', protect, deletePost)
router.post('/:id/pin', protect, pinPost)
router.post('/:id/unpin', protect, unpinPost)
router.delete('/comments/:id', protect, deleteComment)

export default router





