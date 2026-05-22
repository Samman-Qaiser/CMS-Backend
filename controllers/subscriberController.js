import Subscriber from '../models/Subscriber.js'

// ─── CREATE SUBSCRIBER ───────────────────────────────
// POST /api/subscribers
export const createSubscriber = async (req, res) => {
  try {
    const { name, email, phone, status, isUnsubscribed } = req.body

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' })
    }

    const existing = await Subscriber.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' })
    }

    const subscriber = await Subscriber.create({
      name,
      email,
      phone,
      status: status || 'active',
      isUnsubscribed: isUnsubscribed || false,
    })

    res.status(201).json({ success: true, message: 'Subscribed successfully', subscriber })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL SUBSCRIBERS ─────────────────────────────
// GET /api/subscribers
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: subscribers.length, subscribers })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET SUBSCRIBER BY ID ────────────────────────────
// GET /api/subscribers/:id
export const getSubscriberById = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id)

    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' })
    }

    res.status(200).json({ success: true, subscriber })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE SUBSCRIBER ───────────────────────────────
// PUT /api/subscribers/:id
export const updateSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id)

    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' })
    }

    const { name, phone, status, isUnsubscribed } = req.body

    subscriber.name = name || subscriber.name
    subscriber.phone = phone || subscriber.phone
    subscriber.status = status || subscriber.status
    subscriber.isUnsubscribed = isUnsubscribed !== undefined ? isUnsubscribed : subscriber.isUnsubscribed

    await subscriber.save()

    res.status(200).json({ success: true, message: 'Subscriber updated successfully', subscriber })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UNSUBSCRIBE ─────────────────────────────────────
// PUT /api/subscribers/unsubscribe
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    const subscriber = await Subscriber.findOne({ email })

    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' })
    }

    subscriber.isUnsubscribed = true
    subscriber.status = 'inactive'
    await subscriber.save()

    res.status(200).json({ success: true, message: 'Unsubscribed successfully', subscriber })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE SUBSCRIBER ───────────────────────────────
// DELETE /api/subscribers/:id
export const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id)

    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' })
    }

    await subscriber.deleteOne()

    res.status(200).json({ success: true, message: 'Subscriber deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}