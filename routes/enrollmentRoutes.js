import express from 'express'
import {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateProgress,
  deleteEnrollment,
} from '../controllers/enrollmentController.js'

const router = express.Router()

router.post('/', createEnrollment)
router.get('/', getAllEnrollments)
router.get('/:id', getEnrollmentById)
router.put('/:id/progress', updateProgress)
router.delete('/:id', deleteEnrollment)

export default router