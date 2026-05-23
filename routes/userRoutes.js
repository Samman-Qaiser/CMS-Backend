import express from 'express'
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
    applyForInstructor,
  updateInstructorStatus,
} from '../controllers/userController.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/add', upload.single('profileImage'), addUser)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', upload.single('profileImage'), updateUser)
router.delete('/:id', deleteUser)
router.post('/apply-instructor', applyForInstructor)
router.put('/:id/instructor-status', updateInstructorStatus)

export default router