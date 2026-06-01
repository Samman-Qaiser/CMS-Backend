import express from 'express'
import {
  createLiveClass,
  getAllLiveClasses,
  getLiveClassById,
  updateLiveClass,
  joinLiveClass,
  sendChatMessage,
  deleteLiveClass,
} from '../controllers/liveClassController.js'

const router = express.Router()

router.post('/', createLiveClass)
router.get('/', getAllLiveClasses)
router.get('/:id', getLiveClassById)
router.put('/:id', updateLiveClass)
router.put('/:id/join', joinLiveClass)
router.post('/:id/chat', sendChatMessage)
router.delete('/:id', deleteLiveClass)

export default router