import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'spam', 'trash'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Comment', commentSchema)