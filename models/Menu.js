import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['page', 'blog', 'custom_link'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    // page ya blog ka _id
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
  },
  url: {
    type: String,
    default: null,

  },
  order: {
    type: Number,
    default: 0,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  
  },
  titleAttribute: {
    type: String,
    default: null,
  },
  classAttribute: {
    type: String,
    default: null,
  },
  targetAttribute: {
    type: String,
    enum: ['_blank', '_self', '_parent', '_top'],
    default: '_self',
  },
  description: {
    type: String,
    default: null,
  },
})

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu name is required'],
      trim: true,
      unique: true,
    },
    items: [menuItemSchema],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Menu', menuSchema)