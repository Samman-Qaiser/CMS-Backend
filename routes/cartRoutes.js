import express from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js'

const router = express.Router()

router.get('/:userId', getCart)
router.post('/add', addToCart)
router.put('/update', updateCartItem)
router.delete('/remove', removeFromCart)
router.delete('/clear/:userId', clearCart)

export default router