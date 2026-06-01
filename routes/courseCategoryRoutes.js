import express from 'express'
import {
  createCourseCategory,
  getAllCourseCategories,
  getCourseCategoryById,
  updateCourseCategory,
  deleteCourseCategory,
} from '../controllers/courseCategoryController.js'

const router = express.Router()

router.post('/', createCourseCategory)
router.get('/', getAllCourseCategories)
router.get('/:id', getCourseCategoryById)
router.put('/:id', updateCourseCategory)
router.delete('/:id', deleteCourseCategory)

export default router