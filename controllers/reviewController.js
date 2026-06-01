import Review from '../models/Review.js'
import Course from '../models/Course.js'
import Instructor from '../models/Instructor.js'

// ─── Helper: Update Course & Instructor Rating ────────
const updateRatings = async (courseId, instructorId) => {
  // Course rating update
  const courseReviews = await Review.find({
    course: courseId,
    status: 'approved',
  })

  if (courseReviews.length > 0) {
    const avgRating = courseReviews.reduce((acc, r) => acc + r.rating, 0) / courseReviews.length
    await Course.findByIdAndUpdate(courseId, {
      rating: avgRating.toFixed(1),
      totalReviews: courseReviews.length,
    })
  }

  // Instructor rating update
  const instructorReviews = await Review.find({
    instructor: instructorId,
    status: 'approved',
  })

  if (instructorReviews.length > 0) {
    const avgRating = instructorReviews.reduce((acc, r) => acc + r.rating, 0) / instructorReviews.length
    await Instructor.findByIdAndUpdate(instructorId, {
      rating: avgRating.toFixed(1),
    })
  }
}

// ─── CREATE REVIEW ───────────────────────────────────
// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { user, course, instructor, rating, comment } = req.body

    if (!user || !course || !instructor || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    // Already reviewed?
    const existing = await Review.findOne({ user, course })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this course' })
    }

    const review = await Review.create({
      user,
      course,
      instructor,
      rating,
      comment,
      status: 'pending',
    })

    res.status(201).json({ success: true, message: 'Review submitted successfully', review })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL REVIEWS ─────────────────────────────────
// GET /api/reviews
export const getAllReviews = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const courseFilter = req.query.course ? { course: req.query.course } : {}
    const instructorFilter = req.query.instructor ? { instructor: req.query.instructor } : {}

    const reviews = await Review.find({
      ...statusFilter,
      ...courseFilter,
      ...instructorFilter,
    })
      .populate('user', 'firstName lastName profileImage')
      .populate('course', 'title slug thumbnail')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: reviews.length, reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET REVIEW BY ID ────────────────────────────────
// GET /api/reviews/:id
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'firstName lastName profileImage')
      .populate('course', 'title slug')

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    res.status(200).json({ success: true, review })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE REVIEW STATUS ────────────────────────────
// PUT /api/reviews/:id
export const updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' })
    }

    review.status = status
    await review.save()

    // Rating update karo
    await updateRatings(review.course, review.instructor)

    res.status(200).json({ success: true, message: 'Review status updated successfully', review })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE REVIEW ───────────────────────────────────
// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    const { course, instructor } = review

    await review.deleteOne()

    // Rating update karo
    await updateRatings(course, instructor)

    res.status(200).json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}