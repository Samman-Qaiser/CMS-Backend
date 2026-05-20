import Category from '../models/Category.js'

// ─── CREATE CATEGORY ─────────────────────────────────
// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parentCategory } = req.body

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' })
    }

    const existing = await Category.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
    })

    res.status(201).json({ success: true, message: 'Category created successfully', category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL CATEGORIES ──────────────────────────────
// GET /api/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name slug')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: categories.length, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET CATEGORY BY ID ──────────────────────────────
// GET /api/categories/:id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug')

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    res.status(200).json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE CATEGORY ─────────────────────────────────
// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const { name, slug, description, parentCategory } = req.body

    if (slug && slug !== category.slug) {
      const existing = await Category.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    category.name = name || category.name
    category.slug = slug || category.slug
    category.description = description || category.description
    category.parentCategory = parentCategory || category.parentCategory

    await category.save()

    res.status(200).json({ success: true, message: 'Category updated successfully', category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE CATEGORY ─────────────────────────────────
// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    await category.deleteOne()

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}