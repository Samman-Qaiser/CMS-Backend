import express from 'express'
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
    applyForInstructor,
  updateInstructorStatus,
    getInstructorApplications,
} from '../controllers/userController.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/add', upload.single('profileImage'), addUser)
router.get('/instructor-applications', getInstructorApplications)
router.put('/:id/instructor-status', updateInstructorStatus)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', upload.single('profileImage'), updateUser)
router.delete('/:id', deleteUser)
router.post('/apply-instructor', applyForInstructor)


export default router