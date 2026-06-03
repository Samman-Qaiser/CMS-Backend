// controllers/chatController.js
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

// Helper: buffer ko cloudinary pe upload karo
const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const folder = mimetype.startsWith('image') ? 'chat/images'
      : mimetype.startsWith('video') ? 'chat/videos'
      : mimetype.startsWith('audio') ? 'chat/audio'
      : 'chat/documents'

    const resourceType = mimetype.startsWith('image') ? 'image'
      : (mimetype.startsWith('video') || mimetype.startsWith('audio')) ? 'video'
      : 'raw'

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: `${Date.now()}-${originalname}` },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

// GET or CREATE conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId } = req.body
    const senderId = req.user._id

    let conversation = await Conversation.findOne({
      isGroupChat: false,
      participants: { $all: [senderId, receiverId] },
    }).populate('participants', 'firstName lastName profileImage role')

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        createdBy: senderId,
      })
      await conversation.populate('participants', 'firstName lastName profileImage role')
    }

    res.status(200).json({ success: true, conversation })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET my conversations
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'firstName lastName profileImage role')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'firstName lastName' },
      })
      .sort({ updatedAt: -1 })

    res.status(200).json({ success: true, conversations })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET messages of a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = 30

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    res.status(200).json({ success: true, messages: messages.reverse() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST send text message (socket ke sath sync)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body
    const senderId = req.user._id

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
    })

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    })

    await message.populate('sender', 'firstName lastName profileImage')

    res.status(201).json({ success: true, message })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST upload file in chat
export const uploadChatFile = async (req, res) => {
  try {
    const { conversationId } = req.body
    const senderId = req.user._id

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    )

    const fileType = req.file.mimetype.startsWith('image') ? 'image'
      : req.file.mimetype.startsWith('video') ? 'video'
      : req.file.mimetype.startsWith('audio') ? 'audio'
      : 'document'

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content: '',
      fileUrl: result.secure_url,
      fileType,
      fileName: req.file.originalname,
    })

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    })

    await message.populate('sender', 'firstName lastName profileImage')

    res.status(201).json({ success: true, message })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}