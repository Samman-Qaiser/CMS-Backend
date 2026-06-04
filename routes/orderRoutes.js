import express from 'express'
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  deleteOrder,
  getShopCustomers,
  getShopStats,
} from '../controllers/orderController.js'

const router = express.Router()

router.get('/stats/overview', getShopStats)
router.get('/customers/all', getShopCustomers)
router.get('/number/:orderNumber', getOrderByNumber)
router.post('/', createOrder)
router.get('/', getAllOrders)
router.get('/:id', getOrderById)
router.put('/:id/status', updateOrderStatus)
router.delete('/:id', deleteOrder)

export default router