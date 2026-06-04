import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
} from '../controllers/wishlistController.js'

const router = express.Router()

router.get('/:userId', getWishlist)
router.post('/add', addToWishlist)
router.post('/move-to-cart', moveToCart)
router.delete('/remove', removeFromWishlist)
router.delete('/clear/:userId', clearWishlist)

export default router