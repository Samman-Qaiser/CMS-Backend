import Instructor from '../models/Instructor.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import Transaction from '../models/Transaction.js'
import Review from '../models/Review.js'
import { cloudinary } from '../config/cloudinary.js'

// ─── Helper: Cloudinary Upload ───────────────────────
const uploadToCloudinary = async (file, folder) => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: `cms/${folder}`,
  })
  return result.secure_url
}

// ─── GET ALL INSTRUCTORS ─────────────────────────────
// GET /api/instructors
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find()
      .populate('user', 'firstName lastName email username profileImage role')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: instructors.length, instructors })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET INSTRUCTOR BY ID ────────────────────────────
// GET /api/instructors/:id
export const getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id)
      .populate('user', 'firstName lastName email username profileImage')

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' })
    }

    res.status(200).json({ success: true, instructor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET INSTRUCTOR BY USER ID ───────────────────────
// GET /api/instructors/user/:userId
export const getInstructorByUserId = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email username profileImage')

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' })
    }

    res.status(200).json({ success: true, instructor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE INSTRUCTOR PROFILE ───────────────────────
// PUT /api/instructors/:id
export const updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id)

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' })
    }

    const {
      bio,
      designation,
      expertise,
      socialLinks,
      isVerified,
      isActive,
    } = req.body

    // Profile Image
    if (req.files?.profileImage) {
      if (instructor.profileImage) {
        const publicId = 'cms/instructors/' + instructor.profileImage.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      instructor.profileImage = await uploadToCloudinary(
        req.files.profileImage[0],
        'instructors'
      )
    }

    // Cover Image
    if (req.files?.coverImage) {
      if (instructor.coverImage) {
        const publicId = 'cms/instructors/covers/' + instructor.coverImage.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      instructor.coverImage = await uploadToCloudinary(
        req.files.coverImage[0],
        'instructors/covers'
      )
    }

    // Parse expertise array
    const parsedExpertise = expertise
      ? typeof expertise === 'string' ? JSON.parse(expertise) : expertise
      : instructor.expertise

    // Parse socialLinks
    const parsedSocialLinks = socialLinks
      ? typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks
      : instructor.socialLinks

    instructor.bio = bio || instructor.bio
    instructor.designation = designation || instructor.designation
    instructor.expertise = parsedExpertise
    instructor.socialLinks = parsedSocialLinks || instructor.socialLinks
    instructor.isVerified = isVerified !== undefined ? isVerified : instructor.isVerified
    instructor.isActive = isActive !== undefined ? isActive : instructor.isActive

    await instructor.save()

    res.status(200).json({ success: true, message: 'Instructor updated successfully', instructor })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE INSTRUCTOR ───────────────────────────────
// DELETE /api/instructors/:id
export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id)

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' })
    }

    // Images delete karo
    if (instructor.profileImage) {
      const publicId = 'cms/instructors/' + instructor.profileImage.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    if (instructor.coverImage) {
      const publicId = 'cms/instructors/covers/' + instructor.coverImage.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await instructor.deleteOne()

    res.status(200).json({ success: true, message: 'Instructor deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── INSTRUCTOR DASHBOARD STATS ──────────────────────
// GET /api/instructors/:id/stats
export const getInstructorStats = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id)

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' })
    }

    // Total Courses
    const totalCourses = await Course.countDocuments({
      instructor: instructor._id,
    })

    // Total Students
    const courses = await Course.find({ instructor: instructor._id })
    const courseIds = courses.map((c) => c._id)

    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
    })

    // Total Earnings
    const transactions = await Transaction.find({
      instructor: instructor._id,
      status: 'completed',
    })
    const totalEarnings = transactions.reduce((acc, t) => acc + t.amount, 0)

    // This Month Earnings
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthTransactions = await Transaction.find({
      instructor: instructor._id,
      status: 'completed',
      createdAt: { $gte: thisMonth },
    })
    const thisMonthEarnings = thisMonthTransactions.reduce(
      (acc, t) => acc + t.amount, 0
    )

    // Total Reviews
    const totalReviews = await Review.countDocuments({
      instructor: instructor._id,
      status: 'approved',
    })

    // Latest Transactions
    const latestTransactions = await Transaction.find({
      instructor: instructor._id,
    })
      .populate('user', 'firstName lastName email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(5)

    // Popular Courses
    const popularCourses = await Course.find({
      instructor: instructor._id,
    })
      .sort({ totalStudents: -1 })
      .limit(5)
      .select('title thumbnail totalStudents rating price')

    // Monthly Earnings — last 12 months
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          instructor: instructor._id,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])
// Monthly Students — last 12 months
const monthlyStudents = await Enrollment.aggregate([
  {
    $match: {
      course: { $in: courseIds },
    },
  },
  {
    $group: {
      _id: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      },
      total: { $sum: 1 },
    },
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
  { $limit: 12 },
])
    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        totalEarnings,
        thisMonthEarnings,
        totalReviews,
        rating: instructor.rating,
      },
      latestTransactions,
      popularCourses,
      monthlyEarnings,
      monthlyStudents,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}