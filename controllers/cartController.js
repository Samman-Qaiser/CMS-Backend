import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

// ─── Helper: Calculate Totals ─────────────────────────
const calculateTotals = (items) => {
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  return { totalPrice, totalItems }
}

// ─── GET CART ─────────────────────────────────────────
// GET /api/cart/:userId
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId })
      .populate('items.product', 'title images price availability stock')

    if (!cart) {
      cart = await Cart.create({ user: req.params.userId, items: [] })
    }

    res.status(200).json({ success: true, cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── ADD TO CART ──────────────────────────────────────
// POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size } = req.body

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'User ID and Product ID are required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    if (product.availability === 'out_of_stock') {
      return res.status(400).json({ success: false, message: 'Product is out of stock' })
    }

    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] })
    }

    // Item already in cart?
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === (size || null)
    )

    if (existingItem) {
      existingItem.quantity += quantity || 1
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        size: size || null,
        price: product.price,
      })
    }

    // Totals update
    const { totalPrice, totalItems } = calculateTotals(cart.items)
    cart.totalPrice = totalPrice
    cart.totalItems = totalItems

    await cart.save()

    // Populate karke return karo
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'title images price availability')

    res.status(200).json({ success: true, message: 'Item added to cart', cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE CART ITEM ────────────────────────────────
// PUT /api/cart/update
export const updateCartItem = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body

    if (!userId || !itemId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'User ID, item ID and quantity are required' })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    const item = cart.items.id(itemId)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' })
    }

    if (quantity <= 0) {
      // Quantity 0 ya kam — item remove karo
      item.deleteOne()
    } else {
      item.quantity = quantity
    }

    // Totals update
    const { totalPrice, totalItems } = calculateTotals(cart.items)
    cart.totalPrice = totalPrice
    cart.totalItems = totalItems

    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'title images price availability')

    res.status(200).json({ success: true, message: 'Cart updated', cart: updatedCart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── REMOVE FROM CART ────────────────────────────────
// DELETE /api/cart/remove
export const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body

    if (!userId || !itemId) {
      return res.status(400).json({ success: false, message: 'User ID and item ID are required' })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    const item = cart.items.id(itemId)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' })
    }

    item.deleteOne()

    // Totals update
    const { totalPrice, totalItems } = calculateTotals(cart.items)
    cart.totalPrice = totalPrice
    cart.totalItems = totalItems

    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'title images price availability')

    res.status(200).json({ success: true, message: 'Item removed from cart', cart: updatedCart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── CLEAR CART ───────────────────────────────────────
// DELETE /api/cart/clear/:userId
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.items = []
    cart.totalPrice = 0
    cart.totalItems = 0
    await cart.save()

    res.status(200).json({ success: true, message: 'Cart cleared', cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}