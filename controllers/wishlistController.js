import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'

// ─── GET WISHLIST ─────────────────────────────────────
// GET /api/wishlist/:userId
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.params.userId })
      .populate('products', 'title images price rating availability brand')

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.params.userId, products: [] })
    }

    res.status(200).json({ success: true, wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── ADD TO WISHLIST ──────────────────────────────────
// POST /api/wishlist/add
export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'User ID and Product ID are required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    let wishlist = await Wishlist.findOne({ user: userId })
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] })
    }

    // Already in wishlist?
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' })
    }

    wishlist.products.push(productId)
    await wishlist.save()

    wishlist = await Wishlist.findById(wishlist._id)
      .populate('products', 'title images price rating availability brand')

    res.status(200).json({ success: true, message: 'Product added to wishlist', wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── REMOVE FROM WISHLIST ────────────────────────────
// DELETE /api/wishlist/remove
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'User ID and Product ID are required' })
    }

    const wishlist = await Wishlist.findOne({ user: userId })
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' })
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    )

    await wishlist.save()

    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('products', 'title images price rating availability brand')

    res.status(200).json({ success: true, message: 'Product removed from wishlist', wishlist: updatedWishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── CLEAR WISHLIST ───────────────────────────────────
// DELETE /api/wishlist/clear/:userId
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.params.userId })
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' })
    }

    wishlist.products = []
    await wishlist.save()

    res.status(200).json({ success: true, message: 'Wishlist cleared', wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── MOVE TO CART ─────────────────────────────────────
// POST /api/wishlist/move-to-cart
export const moveToCart = async (req, res) => {
  try {
    const { userId, productId } = req.body

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'User ID and Product ID are required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Wishlist se remove karo
    const wishlist = await Wishlist.findOne({ user: userId })
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId
      )
      await wishlist.save()
    }

    // Cart mein add karo
    let cart = await (await import('../models/Cart.js')).default.findOne({ user: userId })
    if (!cart) {
      cart = await (await import('../models/Cart.js')).default.create({ user: userId, items: [] })
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    )

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.items.push({
        product: productId,
        quantity: 1,
        size: null,
        price: product.price,
      })
    }

    const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0)
    cart.totalPrice = totalPrice
    cart.totalItems = totalItems

    await cart.save()

    res.status(200).json({ success: true, message: 'Product moved to cart successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}