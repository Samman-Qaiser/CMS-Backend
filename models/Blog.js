import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
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
    content: {
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    status: {
      type: String,
      enum: ['published', 'draft', 'pending'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'password_protected'],
      default: 'public',
    },
    password: {
      type: String,
      default: null,
    },
    featuredImage: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    scheduledAt: {
      type: Date,
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
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Blog', blogSchema)