import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    // Progress tracking
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    progress: {
      type: Number,
      default: 0, // percentage 0-100
    },
    status: {
      type: String,
      enum: ['on_progress', 'completed', 'no_progress'],
      default: 'no_progress',
    },
    // Payment
    amountPaid: {
      type: Number,
      default: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Enrollment', enrollmentSchema)