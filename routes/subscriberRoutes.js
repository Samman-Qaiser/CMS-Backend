import express from 'express'
import {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  unsubscribe,
  deleteSubscriber,
} from '../controllers/subscriberController.js'

const router = express.Router()

router.post('/', createSubscriber)
router.get('/', getAllSubscribers)
router.get('/:id', getSubscriberById)
router.put('/unsubscribe', unsubscribe)
router.put('/:id', updateSubscriber)
router.delete('/:id', deleteSubscriber)

export default router