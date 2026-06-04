import express from 'express'
import {
  createProductCategory,
  getAllProductCategories,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory,
} from '../controllers/productCategoryController.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/', upload.single('image'), createProductCategory)
router.get('/', getAllProductCategories)
router.get('/:id', getProductCategoryById)
router.put('/:id', upload.single('image'), updateProductCategory)
router.delete('/:id', deleteProductCategory)

export default router