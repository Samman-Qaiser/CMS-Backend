import Coupon from '../models/Coupon.js'

// ─── CREATE COUPON ────────────────────────────────────
// POST /api/coupons
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required' })
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' })
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      expiresAt: expiresAt || null,
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL COUPONS ──────────────────────────────────
// GET /api/coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, total: coupons.length, coupons })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET COUPON BY ID ─────────────────────────────────
// GET /api/coupons/:id
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' })
    }
    res.status(200).json({ success: true, coupon })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── VALIDATE COUPON ──────────────────────────────────
// POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' })
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' })
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is inactive' })
    }

    // Expiry check
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' })
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })
    }

    // Min order amount check
    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${coupon.minOrderAmount}`,
      })
    }

    // Discount calculate karo
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount)
      }
    } else {
      discountAmount = coupon.discountValue
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      coupon,
      discountAmount: discountAmount.toFixed(2),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE COUPON ────────────────────────────────────
// PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' })
    }

    const {
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body

    coupon.discountType = discountType || coupon.discountType
    coupon.discountValue = discountValue !== undefined ? discountValue : coupon.discountValue
    coupon.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount
    coupon.maxDiscount = maxDiscount !== undefined ? maxDiscount : coupon.maxDiscount
    coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit
    coupon.expiresAt = expiresAt || coupon.expiresAt
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive

    await coupon.save()

    res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE COUPON ────────────────────────────────────
// DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' })
    }
    await coupon.deleteOne()
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}