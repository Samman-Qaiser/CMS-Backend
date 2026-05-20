import express from 'express'
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/', upload.single('featuredImage'), createBlog)
router.get('/', getAllBlogs)
router.get('/slug/:slug', getBlogBySlug)
router.get('/:id', getBlogById)
router.put('/:id', upload.single('featuredImage'), updateBlog)
router.delete('/:id', deleteBlog)

export default router