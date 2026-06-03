// socket/chatSocket.js
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'

const onlineUsers = new Map() // userId -> socketId

export const initChatSocket = (io) => {
  io.on('connection', (socket) => {

    // User online
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id)
      io.emit('online_users', Array.from(onlineUsers.keys()))
    })

    // Conversation room join
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId)
    })

    // Message send
    socket.on('send_message', async ({ conversationId, senderId, content }) => {
      try {
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          content,
        })

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: Date.now(),
        })

        await message.populate('sender', 'firstName lastName profileImage')

        io.to(conversationId).emit('message_received', message)
      } catch (err) {
        socket.emit('error', err.message)
      }
    })

    // File message — REST se upload hoga, phir socket se notify
    socket.on('file_sent', ({ conversationId, message }) => {
      io.to(conversationId).emit('message_received', message)
    })

    // Typing indicators
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_typing', { userId })
    })

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stopped_typing')
    })

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.forEach((sId, userId) => {
        if (sId === socket.id) {
          onlineUsers.delete(userId)
          io.emit('user_offline', userId)
        }
      })
    })
  })
}