import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: String,
    default: null,
  },
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    shippingMethod: {
      type: String,
      enum: ['flat_rate', 'free_shipping', 'link_road'],
      default: 'free_shipping',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'cash_on_delivery'],
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'on_hold', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// ─── Auto Order Number ────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const lastOrder = await mongoose.model('Order').findOne().sort({ orderNumber: -1 })
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 181
  }
  next()
})

export default mongoose.model('Order', orderSchema)