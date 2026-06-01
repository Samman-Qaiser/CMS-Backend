import LiveClass from '../models/LiveClass.js'

// ─── CREATE LIVE CLASS ───────────────────────────────
// POST /api/live-classes
export const createLiveClass = async (req, res) => {
  try {
    const {
      title,
      instructor,
      course,
      streamUrl,
      scheduledAt,
    } = req.body

    if (!title || !instructor || !course || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Title, instructor, course and scheduledAt are required' })
    }

    const liveClass = await LiveClass.create({
      title,
      instructor,
      course,
      streamUrl: streamUrl || null,
      scheduledAt,
    })

    res.status(201).json({ success: true, message: 'Live class created successfully', liveClass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL LIVE CLASSES ────────────────────────────
// GET /api/live-classes
export const getAllLiveClasses = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const instructorFilter = req.query.instructor ? { instructor: req.query.instructor } : {}

    const liveClasses = await LiveClass.find({
      ...statusFilter,
      ...instructorFilter,
    })
      .populate('instructor', 'bio designation')
      .populate('course', 'title slug thumbnail')
      .sort({ scheduledAt: 1 })

    res.status(200).json({ success: true, total: liveClasses.length, liveClasses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET LIVE CLASS BY ID ────────────────────────────
// GET /api/live-classes/:id
export const getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('instructor', 'bio designation')
      .populate('course', 'title slug thumbnail')
      .populate('students', 'firstName lastName profileImage')

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' })
    }

    res.status(200).json({ success: true, liveClass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE LIVE CLASS STATUS ────────────────────────
// PUT /api/live-classes/:id
export const updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' })
    }

    const { title, streamUrl, scheduledAt, status } = req.body

    if (status === 'live' && liveClass.status !== 'live') {
      liveClass.startedAt = Date.now()
    }

    if (status === 'ended' && liveClass.status !== 'ended') {
      liveClass.endedAt = Date.now()
    }

    liveClass.title = title || liveClass.title
    liveClass.streamUrl = streamUrl || liveClass.streamUrl
    liveClass.scheduledAt = scheduledAt || liveClass.scheduledAt
    liveClass.status = status || liveClass.status

    await liveClass.save()

    res.status(200).json({ success: true, message: 'Live class updated successfully', liveClass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── JOIN LIVE CLASS ─────────────────────────────────
// PUT /api/live-classes/:id/join
export const joinLiveClass = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' })
    }

    const liveClass = await LiveClass.findById(req.params.id)

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' })
    }

    if (!liveClass.students.includes(userId)) {
      liveClass.students.push(userId)
      liveClass.totalStudents = liveClass.students.length
      await liveClass.save()
    }

    res.status(200).json({ success: true, message: 'Joined live class successfully', liveClass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── SEND CHAT MESSAGE ───────────────────────────────
// POST /api/live-classes/:id/chat
export const sendChatMessage = async (req, res) => {
  try {
    const { userId, message } = req.body

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: 'User ID and message are required' })
    }

    const liveClass = await LiveClass.findById(req.params.id)

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' })
    }

    liveClass.chatMessages.push({
      user: userId,
      message,
      sentAt: Date.now(),
    })

    await liveClass.save()

    res.status(201).json({ success: true, message: 'Message sent successfully', liveClass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE LIVE CLASS ───────────────────────────────
// DELETE /api/live-classes/:id
export const deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' })
    }

    await liveClass.deleteOne()

    res.status(200).json({ success: true, message: 'Live class deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}