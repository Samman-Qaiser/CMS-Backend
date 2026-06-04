import mongoose from 'mongoose'

const productReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
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

export default mongoose.model('ProductReview', productReviewSchema)