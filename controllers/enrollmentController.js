import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'
import Instructor from '../models/Instructor.js'
import Lesson from '../models/Lesson.js'

// ─── CREATE ENROLLMENT ───────────────────────────────
// POST /api/enrollments
export const createEnrollment = async (req, res) => {
  try {
    const { user, course, amountPaid } = req.body

    if (!user || !course) {
      return res.status(400).json({ success: false, message: 'User and course are required' })
    }

    // Already enrolled?
    const existing = await Enrollment.findOne({ user, course })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' })
    }

    const courseExists = await Course.findById(course)
    if (!courseExists) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const enrollment = await Enrollment.create({
      user,
      course,
      amountPaid: amountPaid || courseExists.price,
    })

    // Course totalStudents update karo
    await Course.findByIdAndUpdate(course, {
      $inc: { totalStudents: 1 }
    })

    // Instructor totalStudents update karo
    await Instructor.findByIdAndUpdate(courseExists.instructor, {
      $inc: { totalStudents: 1 }
    })

    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL ENROLLMENTS ─────────────────────────────
// GET /api/enrollments
export const getAllEnrollments = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const courseFilter = req.query.course ? { course: req.query.course } : {}
    const userFilter = req.query.user ? { user: req.query.user } : {}

    const enrollments = await Enrollment.find({
      ...statusFilter,
      ...courseFilter,
      ...userFilter,
    })
      .populate('user', 'firstName lastName email profileImage')
      .populate('course', 'title slug thumbnail price')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: enrollments.length, enrollments })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ENROLLMENT BY ID ────────────────────────────
// GET /api/enrollments/:id
export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'firstName lastName email profileImage')
      .populate('course', 'title slug thumbnail price')
      .populate('completedLessons', 'title type duration')

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' })
    }

    res.status(200).json({ success: true, enrollment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE PROGRESS ─────────────────────────────────
// PUT /api/enrollments/:id/progress
export const updateProgress = async (req, res) => {
  try {
    const { lessonId } = req.body

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'Lesson ID is required' })
    }

    const enrollment = await Enrollment.findById(req.params.id)

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' })
    }

    // Already completed?
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
    }

    // Total lessons count karo
    const totalLessons = await Lesson.countDocuments({ course: enrollment.course })

    // Progress calculate karo
    const progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0

    enrollment.progress = progress

    // Status update karo
    if (progress === 0) {
      enrollment.status = 'no_progress'
    } else if (progress === 100) {
      enrollment.status = 'completed'
      enrollment.completedAt = Date.now()
    } else {
      enrollment.status = 'on_progress'
    }

    await enrollment.save()

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      enrollment,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE ENROLLMENT ───────────────────────────────
// DELETE /api/enrollments/:id
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' })
    }

    const course = await Course.findById(enrollment.course)

    // Course totalStudents kam karo
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { totalStudents: -1 }
    })

    // Instructor totalStudents kam karo
    if (course) {
      await Instructor.findByIdAndUpdate(course.instructor, {
        $inc: { totalStudents: -1 }
      })
    }

    await enrollment.deleteOne()

    res.status(200).json({ success: true, message: 'Enrollment deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}