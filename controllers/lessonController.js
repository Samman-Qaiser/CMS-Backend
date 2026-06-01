import Lesson from '../models/Lesson.js'
import Chapter from '../models/Chapter.js'
import Course from '../models/Course.js'
import { cloudinary } from '../config/cloudinary.js'

// ─── Helper: Cloudinary Upload ───────────────────────
const uploadToCloudinary = async (file, folder) => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: `cms/${folder}`,
    resource_type: 'auto', // video/audio bhi handle karega
  })
  return result.secure_url
}

// ─── CREATE LESSON ───────────────────────────────────
// POST /api/lessons
export const createLesson = async (req, res) => {
  try {
    const {
      title,
      chapter,
      course,
      type,
      duration,
      content,
      questions,
      order,
      isFree,
    } = req.body

    if (!title || !chapter || !course) {
      return res.status(400).json({ success: false, message: 'Title, chapter and course are required' })
    }

    const chapterExists = await Chapter.findById(chapter)
    if (!chapterExists) {
      return res.status(404).json({ success: false, message: 'Chapter not found' })
    }

    // Content URL upload
    let contentUrl = null
    if (req.file) {
      contentUrl = await uploadToCloudinary(req.file, 'lessons')
    }

    // Questions parse karo
    const parsedQuestions = questions
      ? typeof questions === 'string' ? JSON.parse(questions) : questions
      : []

    const lesson = await Lesson.create({
      title,
      chapter,
      course,
      type: type || 'video',
      contentUrl,
      duration: duration || null,
      content: content || null,
      questions: parsedQuestions,
      order: order || 0,
      isFree: isFree === 'true' || isFree === true || false,
    })

    // Course totalContent update karo
    await Course.findByIdAndUpdate(course, {
      $inc: { totalContent: 1 }
    })

    res.status(201).json({ success: true, message: 'Lesson created successfully', lesson })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET LESSONS BY CHAPTER ──────────────────────────
// GET /api/lessons/chapter/:chapterId
export const getLessonsByChapter = async (req, res) => {
  try {
    const lessons = await Lesson.find({ chapter: req.params.chapterId })
      .sort({ order: 1 })

    res.status(200).json({ success: true, total: lessons.length, lessons })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET LESSONS BY COURSE ───────────────────────────
// GET /api/lessons/course/:courseId
export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId })
      .populate('chapter', 'title order')
      .sort({ order: 1 })

    res.status(200).json({ success: true, total: lessons.length, lessons })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET LESSON BY ID ────────────────────────────────
// GET /api/lessons/:id
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('chapter', 'title order')
      .populate('course', 'title slug')

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    res.status(200).json({ success: true, lesson })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE LESSON ───────────────────────────────────
// PUT /api/lessons/:id
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    const {
      title,
      type,
      duration,
      content,
      questions,
      order,
      isFree,
      isActive,
    } = req.body

    // New content file
    if (req.file) {
      if (lesson.contentUrl) {
        const publicId = 'cms/lessons/' + lesson.contentUrl.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      lesson.contentUrl = await uploadToCloudinary(req.file, 'lessons')
    }

    const parsedQuestions = questions
      ? typeof questions === 'string' ? JSON.parse(questions) : questions
      : lesson.questions

    lesson.title = title || lesson.title
    lesson.type = type || lesson.type
    lesson.duration = duration || lesson.duration
    lesson.content = content || lesson.content
    lesson.questions = parsedQuestions
    lesson.order = order !== undefined ? order : lesson.order
    lesson.isFree = isFree !== undefined ? isFree === 'true' || isFree === true : lesson.isFree
    lesson.isActive = isActive !== undefined ? isActive : lesson.isActive

    await lesson.save()

    res.status(200).json({ success: true, message: 'Lesson updated successfully', lesson })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE LESSON ───────────────────────────────────
// DELETE /api/lessons/:id
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    if (lesson.contentUrl) {
      const publicId = 'cms/lessons/' + lesson.contentUrl.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    // Course totalContent kam karo
    await Course.findByIdAndUpdate(lesson.course, {
      $inc: { totalContent: -1 }
    })

    await lesson.deleteOne()

    res.status(200).json({ success: true, message: 'Lesson deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}