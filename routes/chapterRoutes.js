import express from 'express'
import {
  createChapter,
  getChaptersByCourse,
  getChapterById,
  updateChapter,
  deleteChapter,
} from '../controllers/chapterController.js'

const router = express.Router()

router.post('/', createChapter)
router.get('/course/:courseId', getChaptersByCourse)
router.get('/:id', getChapterById)
router.put('/:id', updateChapter)
router.delete('/:id', deleteChapter)

export default router