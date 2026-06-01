import express from 'express'
import {
  getAllInstructors,
  getInstructorById,
  getInstructorByUserId,
  updateInstructor,
  deleteInstructor,
  getInstructorStats,
} from '../controllers/instructorController.js'
import multer from 'multer'

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
])

router.get('/', getAllInstructors)
router.get('/user/:userId', getInstructorByUserId)
router.get('/:id/stats', getInstructorStats)
router.get('/:id', getInstructorById)
router.put('/:id', uploadFields, updateInstructor)
router.delete('/:id', deleteInstructor)

export default router