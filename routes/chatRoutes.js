// routes/chatRoutes.js
import express from 'express'
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  uploadChatFile,markAsRead
} from '../controllers/chatController.js'
import { protect } from '../midleware/authMiddleware.js'
import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/conversations', protect, getOrCreateConversation)
router.get('/conversations', protect, getMyConversations)
router.get('/conversations/:conversationId/messages', protect, getMessages)
router.post('/messages', protect, sendMessage)
router.post('/messages/upload', protect, upload.single('file'), uploadChatFile)

router.put('/conversations/:conversationId/read', protect, markAsRead)

export default router