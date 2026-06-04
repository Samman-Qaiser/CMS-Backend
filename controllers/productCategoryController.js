import ProductCategory from '../models/ProductCategory.js'
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

// ─── CREATE CATEGORY ─────────────────────────────────
// POST /api/product-categories
export const createProductCategory = async (req, res) => {
  try {
    const { name, slug, description, parentCategory, isActive } = req.body

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' })
    }

    const existing = await ProductCategory.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    // Image upload
    let image = null
    if (req.file) {
      image = await uploadToCloudinary(req.file, 'product-categories')
    }

    const category = await ProductCategory.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json({ success: true, message: 'Category created successfully', category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL CATEGORIES ──────────────────────────────
// GET /api/product-categories
export const getAllProductCategories = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { name: { $regex: req.query.search, $options: 'i' } }
      : {}

    const categories = await ProductCategory.find(keyword)
      .populate('parentCategory', 'name slug')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: categories.length, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET CATEGORY BY ID ──────────────────────────────
// GET /api/product-categories/:id
export const getProductCategoryById = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id)
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
// PUT /api/product-categories/:id
export const updateProductCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const { name, slug, description, parentCategory, isActive } = req.body

    if (slug && slug !== category.slug) {
      const existing = await ProductCategory.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    // Image update
    if (req.file) {
      if (category.image) {
        const publicId = 'cms/product-categories/' + category.image.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      category.image = await uploadToCloudinary(req.file, 'product-categories')
    }

    category.name = name || category.name
    category.slug = slug || category.slug
    category.description = description || category.description
    category.parentCategory = parentCategory || category.parentCategory
    category.isActive = isActive !== undefined ? isActive : category.isActive

    await category.save()

    res.status(200).json({ success: true, message: 'Category updated successfully', category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE CATEGORY ─────────────────────────────────
// DELETE /api/product-categories/:id
export const deleteProductCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    if (category.image) {
      const publicId = 'cms/product-categories/' + category.image.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await category.deleteOne()

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}