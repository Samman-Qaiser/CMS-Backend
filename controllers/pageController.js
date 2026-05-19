import Page from '../models/Page.js'
import { cloudinary } from '../config/cloudinary.js'

// ─── Helper: Cloudinary Upload ───────────────────────
const uploadToCloudinary = async (file) => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'cms/pages',
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  })
  return result.secure_url
}

// ─── CREATE PAGE ─────────────────────────────────────
// POST /api/pages
export const createPage = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      slug,
      content,
      author,
      status,
      visibility,
      publishedAt,
      metaTitle,
      metaKeywords,
      metaDescription,
      order,
    } = req.body

    // Validation
    if (!title || !slug || !author) {
      return res.status(400).json({ success: false, message: 'Title, slug and author are required' })
    }

    // Slug already exist?
    const existingPage = await Page.findOne({ slug })
    if (existingPage) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    // Featured image
    let featuredImage = null
    if (req.file) {
      featuredImage = await uploadToCloudinary(req.file)
    }

    const page = await Page.create({
      title,
      excerpt,
      slug,
      content,
      author,
      status: status || 'draft',
      visibility: visibility || 'public',
      publishedAt: status === 'published' ? publishedAt || Date.now() : null,
      featuredImage,
      metaTitle,
      metaKeywords,
      metaDescription,
      order: order || 0,
    })

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      page,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL PAGES ───────────────────────────────────
// GET /api/pages
export const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find()
      .populate('author', 'firstName lastName email')
      .sort({ order: 1, createdAt: -1 })

    res.status(200).json({
      success: true,
      total: pages.length,
      pages,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET PAGE BY ID ──────────────────────────────────
// GET /api/pages/:id
export const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('author', 'firstName lastName email')

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' })
    }

    res.status(200).json({
      success: true,
      page,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET PAGE BY SLUG ────────────────────────────────
// GET /api/pages/slug/:slug
export const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug })
      .populate('author', 'firstName lastName email')

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' })
    }

    res.status(200).json({
      success: true,
      page,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE PAGE ─────────────────────────────────────
// PUT /api/pages/:id
export const updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' })
    }

    const {
      title,
      excerpt,
      slug,
      content,
      author,
      status,
      visibility,
      publishedAt,
      metaTitle,
      metaKeywords,
      metaDescription,
      order,
    } = req.body

    // Slug change hua hai toh check karo duplicate toh nahi
    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({ slug })
      if (existingPage) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    // Nai image aayi toh purani delete karo
    if (req.file) {
      if (page.featuredImage) {
        const publicId = 'cms/pages/' + page.featuredImage.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      page.featuredImage = await uploadToCloudinary(req.file)
    }

    page.title = title || page.title
    page.excerpt = excerpt || page.excerpt
    page.slug = slug || page.slug
    page.content = content || page.content
    page.author = author || page.author
    page.status = status || page.status
    page.visibility = visibility || page.visibility
    page.publishedAt = status === 'published' ? publishedAt || page.publishedAt || Date.now() : page.publishedAt
    page.metaTitle = metaTitle || page.metaTitle
    page.metaKeywords = metaKeywords || page.metaKeywords
    page.metaDescription = metaDescription || page.metaDescription
    page.order = order !== undefined ? order : page.order

    await page.save()

    res.status(200).json({
      success: true,
      message: 'Page updated successfully',
      page,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE PAGE ─────────────────────────────────────
// DELETE /api/pages/:id
export const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' })
    }

    // Cloudinary se image delete karo
    if (page.featuredImage) {
      const publicId = 'cms/pages/' + page.featuredImage.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await page.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}