import express from 'express'
import {
  createPage,
  getAllPages,
  getPageById,
  getPageBySlug,
  updatePage,
  deletePage,
} from '../controllers/pageController.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/', upload.single('featuredImage'), createPage)
router.get('/', getAllPages)
router.get('/slug/:slug', getPageBySlug)
router.get('/:id', getPageById)
router.put('/:id', upload.single('featuredImage'), updatePage)
router.delete('/:id', deletePage)

export default router