import express from 'express'
import {
  createComment,
  getAllComments,
  getCommentById,
  updateCommentStatus,
  deleteComment,
} from '../controllers/commentController.js'

const router = express.Router()

router.post('/', createComment)
router.get('/', getAllComments)
router.get('/:id', getCommentById)
router.put('/:id', updateCommentStatus)
router.delete('/:id', deleteComment)

export default router