import ShippingAddress from '../models/ShippingAddress.js'

// ─── CREATE ADDRESS ───────────────────────────────────
// POST /api/shipping-addresses
export const createShippingAddress = async (req, res) => {
  try {
    const {
      user,
      fullName,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      isDefault,
    } = req.body

    if (!user || !fullName || !phone || !address || !city || !country) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' })
    }

    // Agar isDefault true hai toh purane default ko false karo
    if (isDefault) {
      await ShippingAddress.updateMany({ user }, { isDefault: false })
    }

    const shippingAddress = await ShippingAddress.create({
      user,
      fullName,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      isDefault: isDefault || false,
    })

    res.status(201).json({ success: true, message: 'Address added successfully', shippingAddress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET USER ADDRESSES ───────────────────────────────
// GET /api/shipping-addresses/:userId
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await ShippingAddress.find({ user: req.params.userId })
      .sort({ isDefault: -1, createdAt: -1 })

    res.status(200).json({ success: true, total: addresses.length, addresses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE ADDRESS ───────────────────────────────────
// PUT /api/shipping-addresses/:id
export const updateShippingAddress = async (req, res) => {
  try {
    const shippingAddress = await ShippingAddress.findById(req.params.id)
    if (!shippingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }

    const {
      fullName, phone, address,
      city, state, country, zipCode, isDefault,
    } = req.body

    // Agar isDefault true hai toh purane default ko false karo
    if (isDefault) {
      await ShippingAddress.updateMany(
        { user: shippingAddress.user },
        { isDefault: false }
      )
    }

    shippingAddress.fullName = fullName || shippingAddress.fullName
    shippingAddress.phone = phone || shippingAddress.phone
    shippingAddress.address = address || shippingAddress.address
    shippingAddress.city = city || shippingAddress.city
    shippingAddress.state = state || shippingAddress.state
    shippingAddress.country = country || shippingAddress.country
    shippingAddress.zipCode = zipCode || shippingAddress.zipCode
    shippingAddress.isDefault = isDefault !== undefined ? isDefault : shippingAddress.isDefault

    await shippingAddress.save()

    res.status(200).json({ success: true, message: 'Address updated successfully', shippingAddress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE ADDRESS ───────────────────────────────────
// DELETE /api/shipping-addresses/:id
export const deleteShippingAddress = async (req, res) => {
  try {
    const shippingAddress = await ShippingAddress.findById(req.params.id)
    if (!shippingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }
    await shippingAddress.deleteOne()
    res.status(200).json({ success: true, message: 'Address deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── SET DEFAULT ADDRESS ──────────────────────────────
// PUT /api/shipping-addresses/:id/set-default
export const setDefaultAddress = async (req, res) => {
  try {
    const shippingAddress = await ShippingAddress.findById(req.params.id)
    if (!shippingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }

    await ShippingAddress.updateMany(
      { user: shippingAddress.user },
      { isDefault: false }
    )

    shippingAddress.isDefault = true
    await shippingAddress.save()

    res.status(200).json({ success: true, message: 'Default address updated', shippingAddress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}