import express from 'express'
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllProductReviews,
  updateProductReviewStatus,
} from '../controllers/productController.js'
import multer from 'multer'
import upload from '../midleware/upload.js'
const router = express.Router()



// ─── Reviews ──────────────────────────────────────────
router.get('/reviews/all', getAllProductReviews)
router.put('/reviews/:reviewId', updateProductReviewStatus)

// ─── Products ─────────────────────────────────────────
router.post('/', upload.array('images', 10), createProduct)
router.get('/', getAllProducts)
router.get('/slug/:slug', getProductBySlug)
router.get('/:id', getProductById)
router.put('/:id', upload.array('images', 10), updateProduct)
router.delete('/:id', deleteProduct)

// ─── Product Reviews ──────────────────────────────────
router.post('/:id/reviews', createProductReview)

export default router