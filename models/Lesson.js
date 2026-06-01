import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    type: {
      type: String,
      enum: ['video', 'audio', 'module', 'quiz'],
      default: 'video',
    },
    // Video/Audio k liye
    contentUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: String,
      default: null, // "1:00"
    },
    // Module k liye
    content: {
      type: String,
      default: null,
    },
    // Quiz k liye
    questions: [
      {
        question: { type: String },
        options: [{ type: String }],
        correctAnswer: { type: Number }, // index of correct option
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false, // preview k liye free
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Lesson', lessonSchema)