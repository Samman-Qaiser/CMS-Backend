import CourseCategory from '../models/CourseCategory.js'

// ─── CREATE CATEGORY ─────────────────────────────────
// POST /api/course-categories
export const createCourseCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, isActive } = req.body

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' })
    }

    const existing = await CourseCategory.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    const category = await CourseCategory.create({
      name,
      slug,
      description,
      icon,
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json({ success: true, message: 'Category created successfully', category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL CATEGORIES ──────────────────────────────
// GET /api/course-categories
export const getAllCourseCategories = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { name: { $regex: req.query.search, $options: 'i' } }
      : {}

    const categories = await CourseCategory.find(keyword).sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: categories.length, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET CATEGORY BY ID ──────────────────────────────
// GET /api/course-categories/:id
export const getCourseCategoryById = async (req, res) => {
  try {
    const category = await CourseCategory.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    res.status(200).json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE CATEGORY ─────────────────────────────────
// PUT /api/course-categories/:id
export const updateCourseCategory = async (req, res) => {
  try {
    const category = await CourseCategory.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const { name, slug, description, icon, isActive } = req.body

    if (slug && slug !== category.slug) {
      const existing = await CourseCategory.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    category.name = name || category.name
    category.slug = slug || category.slug
    category.description = description || category.description
    category.icon = icon || category.icon
    category.isActive = isActive !== undefined ? isActive : category.isActive

    await category.save()

    res.status(200).json({ success: true, message: 'Category updated successfully', category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE CATEGORY ─────────────────────────────────
// DELETE /api/course-categories/:id
export const deleteCourseCategory = async (req, res) => {
  try {
    const category = await CourseCategory.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    await category.deleteOne()

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}