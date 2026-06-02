import Schedule from '../models/Schedule.js'

// ─── CREATE SCHEDULE ─────────────────────────────────
// POST /api/schedules
export const createSchedule = async (req, res) => {
  try {
    const {
      instructor,
      title,
      description,
      startTime,
      endTime,
      type,
      color,
    } = req.body

    if (!instructor || !title || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Instructor, title, startTime and endTime are required' })
    }

    const schedule = await Schedule.create({
      instructor,
      title,
      description,
      startTime,
      endTime,
      type: type || 'event',
      color: color || null,
    })

    res.status(201).json({ success: true, message: 'Schedule created successfully', schedule })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL SCHEDULES ───────────────────────────────
// GET /api/schedules
export const getAllSchedules = async (req, res) => {
  try {
    const instructorFilter = req.query.instructor ? { instructor: req.query.instructor } : {}
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const typeFilter = req.query.type ? { type: req.query.type } : {}

    const schedules = await Schedule.find({
      ...instructorFilter,
      ...statusFilter,
      ...typeFilter,
    })
      .populate('instructor', 'bio designation')
     
      .sort({ startTime: 1 })

    res.status(200).json({ success: true, total: schedules.length, schedules })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET SCHEDULE BY ID ──────────────────────────────
// GET /api/schedules/:id
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('instructor', 'bio designation')
      

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' })
    }

    res.status(200).json({ success: true, schedule })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE SCHEDULE ─────────────────────────────────
// PUT /api/schedules/:id
export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' })
    }

    const {
      title,
     
      description,
      startTime,
      endTime,
      type,
      color,
      status,
    } = req.body

    schedule.title = title || schedule.title
    
    schedule.description = description || schedule.description
    schedule.startTime = startTime || schedule.startTime
    schedule.endTime = endTime || schedule.endTime
    schedule.type = type || schedule.type
    schedule.color = color || schedule.color
    schedule.status = status || schedule.status

    await schedule.save()

    res.status(200).json({ success: true, message: 'Schedule updated successfully', schedule })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE SCHEDULE ─────────────────────────────────
// DELETE /api/schedules/:id
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' })
    }

    await schedule.deleteOne()

    res.status(200).json({ success: true, message: 'Schedule deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}