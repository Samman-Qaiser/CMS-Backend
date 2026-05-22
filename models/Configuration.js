import mongoose from 'mongoose'

const configurationSchema = new mongoose.Schema(
  {
    // Settings Tab
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Misc Tab
    title: {
      type: String,
      default: null,
    },
    inputType: {
      type: String,
      enum: ['text', 'image', 'select', 'number', 'email', 'textarea', 'boolean'],
      default: 'text',
    },
    description: {
      type: String,
      default: null,
    },
    params: {
      type: String,
      default: null,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    // Category
    category: {
      type: String,
      enum: ['site', 'reading', 'social', 'widget', 'theme', 'misc'],
      default: 'misc',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Configuration', configurationSchema)