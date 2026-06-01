import express from 'express'
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/', upload.single('thumbnail'), createCourse)
router.get('/', getAllCourses)
router.get('/slug/:slug', getCourseBySlug)
router.get('/:id', getCourseById)
router.put('/:id', upload.single('thumbnail'), updateCourse)
router.delete('/:id', deleteCourse)

export default router