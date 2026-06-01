import Chapter from '../models/Chapter.js'
import Course from '../models/Course.js'

// ─── CREATE CHAPTER ──────────────────────────────────
// POST /api/chapters
export const createChapter = async (req, res) => {
  try {
    const { title, course, order } = req.body

    if (!title || !course) {
      return res.status(400).json({ success: false, message: 'Title and course are required' })
    }

    const courseExists = await Course.findById(course)
    if (!courseExists) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const chapter = await Chapter.create({
      title,
      course,
      order: order || 0,
    })

    res.status(201).json({ success: true, message: 'Chapter created successfully', chapter })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL CHAPTERS BY COURSE ──────────────────────
// GET /api/chapters/course/:courseId
export const getChaptersByCourse = async (req, res) => {
  try {
    const chapters = await Chapter.find({ course: req.params.courseId })
      .sort({ order: 1 })

    res.status(200).json({ success: true, total: chapters.length, chapters })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET CHAPTER BY ID ───────────────────────────────
// GET /api/chapters/:id
export const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('course', 'title slug')

    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' })
    }

    res.status(200).json({ success: true, chapter })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE CHAPTER ──────────────────────────────────
// PUT /api/chapters/:id
export const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)

    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' })
    }

    const { title, order, isActive } = req.body

    chapter.title = title || chapter.title
    chapter.order = order !== undefined ? order : chapter.order
    chapter.isActive = isActive !== undefined ? isActive : chapter.isActive

    await chapter.save()

    res.status(200).json({ success: true, message: 'Chapter updated successfully', chapter })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE CHAPTER ──────────────────────────────────
// DELETE /api/chapters/:id
export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)

    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' })
    }

    await chapter.deleteOne()

    res.status(200).json({ success: true, message: 'Chapter deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}