import mongoose from 'mongoose'

const instructorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: null,
    },
    designation: {
      type: String,
      default: null,
    },
    expertise: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    socialLinks: {
      facebook: { type: String, default: null },
      twitter: { type: String, default: null },
      linkedin: { type: String, default: null },
      youtube: { type: String, default: null },
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
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

export default mongoose.model('Instructor', instructorSchema)