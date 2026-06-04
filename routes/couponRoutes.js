import express from 'express'
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js'

const router = express.Router()

router.post('/', createCoupon)
router.post('/validate', validateCoupon)
router.get('/', getAllCoupons)
router.get('/:id', getCouponById)
router.put('/:id', updateCoupon)
router.delete('/:id', deleteCoupon)

export default router