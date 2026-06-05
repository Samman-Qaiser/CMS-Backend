import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── CREATE ORDER ─────────────────────────────────────
// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      user,
      items,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      couponCode,
      notes,
    } = req.body

    if (!user || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'User, items and shipping address are required' })
    }

    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` })
      }

      orderItems.push({
        product: product._id,
        title: product.title,
        image: product.images[0] || null,
        price: product.price,
        quantity: item.quantity,
        size: item.size || null,
      })

      subtotal += product.price * item.quantity
    }

    const shippingCost = shippingMethod === 'flat_rate' ? 10 : 0

    let discount = 0
    let couponId = null

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount)
          }
        } else {
          discount = coupon.discountValue
        }
        coupon.usedCount += 1
        await coupon.save()
        couponId = coupon._id
      }
    }

    const totalAmount = subtotal + shippingCost - discount

    const order = await Order.create({
      user,
      items: orderItems,
      shippingAddress,
      shippingMethod: shippingMethod || 'free_shipping',
      paymentMethod: paymentMethod || 'card',
      subtotal,
      shippingCost,
      discount,
      totalAmount,
      coupon: couponId,
      notes,
    })

    await Cart.findOneAndUpdate(
      { user },
      { items: [], totalPrice: 0, totalItems: 0 }
    )

    try {
      await resend.emails.send({
        from: 'CMS Shop <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Order #${order.orderNumber}`,
        html: `
          <h2>New Order Received!</h2>
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
          <p><strong>Items:</strong> ${orderItems.length}</p>
        `,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order })

  } catch (error) {
    // ← EXTENSIVE ERROR LOGGING
    console.error('=== CREATE ORDER ERROR ===')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Name:', error.name)
    console.error('req.body:', JSON.stringify(req.body, null, 2))
    console.error('==========================')
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      errorName: error.name,
      errorStack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      receivedBody: req.body  // ← body dekho — undefined toh nahi?
    })
  }
}

// ─── GET ALL ORDERS ───────────────────────────────────
// GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const userFilter = req.query.user ? { user: req.query.user } : {}

    // Pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Order.countDocuments({ ...statusFilter, ...userFilter })

    const orders = await Order.find({ ...statusFilter, ...userFilter })
      .populate('user', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ORDER BY ID ──────────────────────────────────
// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email profileImage phone')
      .populate('items.product', 'title images')
      .populate('coupon', 'code discountType discountValue')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ORDER BY NUMBER ──────────────────────────────
// GET /api/orders/number/:orderNumber
export const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE ORDER STATUS ──────────────────────────────
// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const { status, paymentStatus } = req.body

    if (status) order.status = status
    if (paymentStatus) order.paymentStatus = paymentStatus

    await order.save()

    // User ko email bhejo
    try {
      await resend.emails.send({
        from: 'CMS Shop <onboarding@resend.dev>',
        to: order.user.email,
        subject: `Order #${order.orderNumber} Status Update`,
        html: `
          <h2>Order Status Updated</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
        `,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    res.status(200).json({ success: true, message: 'Order status updated', order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE ORDER ─────────────────────────────────────
// DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    await order.deleteOne()
    res.status(200).json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET SHOP CUSTOMERS ───────────────────────────────
// GET /api/orders/customers/all
export const getShopCustomers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 8
    const skip = (page - 1) * limit

    const keyword = req.query.search
      ? {
          $or: [
            { 'user.firstName': { $regex: req.query.search, $options: 'i' } },
            { 'user.email': { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {}

    // Unique customers lao jo ne order kiya ho
    const customers = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrder: { $max: '$createdAt' },
          billingAddress: { $first: '$shippingAddress' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $sort: { lastOrder: -1 } },
      { $skip: skip },
      { $limit: limit },
    ])

    const total = await Order.distinct('user').then((u) => u.length)

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      customers,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── SHOP STATS ───────────────────────────────────────
// GET /api/orders/stats/overview
export const getShopStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])

    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const processingOrders = await Order.countDocuments({ status: 'processing' })

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        processingOrders,
      },
      monthlyRevenue,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}