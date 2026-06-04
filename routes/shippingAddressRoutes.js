import express from 'express'
import {
  createShippingAddress,
  getUserAddresses,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultAddress,
} from '../controllers/shippingAddressController.js'

const router = express.Router()

router.post('/', createShippingAddress)
router.get('/:userId', getUserAddresses)
router.put('/:id/set-default', setDefaultAddress)
router.put('/:id', updateShippingAddress)
router.delete('/:id', deleteShippingAddress)

export default router