import express from 'express'
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController.js'

const router = express.Router()

router.post('/', createReview)
router.get('/', getAllReviews)
router.get('/:id', getReviewById)
router.put('/:id', updateReviewStatus)
router.delete('/:id', deleteReview)

export default router