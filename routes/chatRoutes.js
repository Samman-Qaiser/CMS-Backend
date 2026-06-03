// routes/chatRoutes.js
import express from 'express'
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  uploadChatFile,
} from '../controllers/chatController.js'

import upload from '../midleware/upload.js'

const router = express.Router()

router.post('/conversations',  getOrCreateConversation)
router.get('/conversations',  getMyConversations)
router.get('/conversations/:conversationId/messages',  getMessages)
router.post('/messages',  sendMessage)
router.post('/messages/upload',  upload.single('file'), uploadChatFile)

export default router