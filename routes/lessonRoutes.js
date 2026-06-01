import express from 'express'
import {
  createLesson,
  getLessonsByChapter,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/', upload.single('contentUrl'), createLesson)
router.get('/chapter/:chapterId', getLessonsByChapter)
router.get('/course/:courseId', getLessonsByCourse)
router.get('/:id', getLessonById)
router.put('/:id', upload.single('contentUrl'), updateLesson)
router.delete('/:id', deleteLesson)

export default router