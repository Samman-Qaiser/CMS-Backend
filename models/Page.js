import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    excerpt: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    featuredImage: {
      type: String,
      default: null,
    },
    // SEO
    metaTitle: {
      type: String,
      default: null,
    },
    metaKeywords: {
      type: String,
      default: null,
    },
    metaDescription: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)


const Page=mongoose.model('Page', pageSchema)
export default Page