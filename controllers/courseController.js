import Course from '../models/Course.js'
import Instructor from '../models/Instructor.js'
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

// ─── CREATE COURSE ───────────────────────────────────
// POST /api/courses
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      excerpt,
      instructor,
      category,
      previewVideo,
      price,
      originalPrice,
      level,
      language,
      requirements,
      whatYouLearn,
      tags,
      status,
    } = req.body

    if (!title || !slug || !instructor || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title, slug, instructor, category and price are required' })
    }

    const existing = await Course.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    // Thumbnail upload
    let thumbnail = null
    if (req.file) {
      thumbnail = await uploadToCloudinary(req.file, 'courses')
    }

    // Parse arrays
    const parsedRequirements = requirements
      ? typeof requirements === 'string' ? JSON.parse(requirements) : requirements
      : []

    const parsedWhatYouLearn = whatYouLearn
      ? typeof whatYouLearn === 'string' ? JSON.parse(whatYouLearn) : whatYouLearn
      : []

    const parsedTags = tags
      ? typeof tags === 'string' ? JSON.parse(tags) : tags
      : []

    const course = await Course.create({
      title,
      slug,
      description,
      excerpt,
      instructor,
      category,
      thumbnail,
      previewVideo,
      price,
      originalPrice: originalPrice || price,
      level: level || 'beginner',
      language: language || 'English',
      requirements: parsedRequirements,
      whatYouLearn: parsedWhatYouLearn,
      tags: parsedTags,
      status: status || 'draft',
    })

    // Instructor totalCourses update karo
    await Instructor.findByIdAndUpdate(instructor, {
      $inc: { totalCourses: 1 }
    })

    res.status(201).json({ success: true, message: 'Course created successfully', course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL COURSES ─────────────────────────────────
// GET /api/courses
export const getAllCourses = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { title: { $regex: req.query.search, $options: 'i' } }
      : {}

    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const categoryFilter = req.query.category ? { category: req.query.category } : {}
    const levelFilter = req.query.level ? { level: req.query.level } : {}
    const instructorFilter = req.query.instructor ? { instructor: req.query.instructor } : {}

    const courses = await Course.find({
      ...keyword,
      ...statusFilter,
      ...categoryFilter,
      ...levelFilter,
      ...instructorFilter,
    })
      .populate('instructor', 'bio designation rating totalStudents')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: courses.length, courses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET COURSE BY ID ────────────────────────────────
// GET /api/courses/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'bio designation rating totalStudents profileImage user')
      .populate('category', 'name slug')

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.status(200).json({ success: true, course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET COURSE BY SLUG ──────────────────────────────
// GET /api/courses/slug/:slug
export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'bio designation rating totalStudents profileImage user')
      .populate('category', 'name slug')

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    res.status(200).json({ success: true, course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE COURSE ───────────────────────────────────
// PUT /api/courses/:id
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const {
      title,
      slug,
      description,
      excerpt,
      category,
      previewVideo,
      price,
      originalPrice,
      level,
      language,
      requirements,
      whatYouLearn,
      tags,
      status,
      isActive,
    } = req.body

    if (slug && slug !== course.slug) {
      const existing = await Course.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    // Thumbnail update
    if (req.file) {
      if (course.thumbnail) {
        const publicId = 'cms/courses/' + course.thumbnail.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      course.thumbnail = await uploadToCloudinary(req.file, 'courses')
    }

    // Parse arrays
    const parsedRequirements = requirements
      ? typeof requirements === 'string' ? JSON.parse(requirements) : requirements
      : course.requirements

    const parsedWhatYouLearn = whatYouLearn
      ? typeof whatYouLearn === 'string' ? JSON.parse(whatYouLearn) : whatYouLearn
      : course.whatYouLearn

    const parsedTags = tags
      ? typeof tags === 'string' ? JSON.parse(tags) : tags
      : course.tags

    course.title = title || course.title
    course.slug = slug || course.slug
    course.description = description || course.description
    course.excerpt = excerpt || course.excerpt
    course.category = category || course.category
    course.previewVideo = previewVideo || course.previewVideo
    course.price = price !== undefined ? price : course.price
    course.originalPrice = originalPrice !== undefined ? originalPrice : course.originalPrice
    course.level = level || course.level
    course.language = language || course.language
    course.requirements = parsedRequirements
    course.whatYouLearn = parsedWhatYouLearn
    course.tags = parsedTags
    course.status = status || course.status
    course.isActive = isActive !== undefined ? isActive : course.isActive

    await course.save()

    res.status(200).json({ success: true, message: 'Course updated successfully', course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE COURSE ───────────────────────────────────
// DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    // Thumbnail delete karo
    if (course.thumbnail) {
      const publicId = 'cms/courses/' + course.thumbnail.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    // Instructor totalCourses kam karo
    await Instructor.findByIdAndUpdate(course.instructor, {
      $inc: { totalCourses: -1 }
    })

    await course.deleteOne()

    res.status(200).json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}