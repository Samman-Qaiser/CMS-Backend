import Blog from '../models/Blog.js'
import { cloudinary } from '../config/cloudinary.js'

// ─── Helper: Cloudinary Upload ───────────────────────
const uploadToCloudinary = async (file) => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'cms/blogs',
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  })
  return result.secure_url
}

// ─── CREATE BLOG ─────────────────────────────────────
// POST /api/blogs
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      slug,
      author,
      categories,
      tags,
      status,
      visibility,
      password,
      videoUrl,
      publishedAt,
      scheduledAt,
      metaTitle,
      metaKeywords,
      metaDescription,
    } = req.body

    if (!title || !slug || !author) {
      return res.status(400).json({ success: false, message: 'Title, slug and author are required' })
    }

    const existing = await Blog.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    // Featured image
    let featuredImage = null
    if (req.file) {
      featuredImage = await uploadToCloudinary(req.file)
    }

    // Categories aur tags array parse karo
    // form-data mein string aati hai
    const parsedCategories = categories
      ? typeof categories === 'string'
        ? JSON.parse(categories)
        : categories
      : []

    const parsedTags = tags
      ? typeof tags === 'string'
        ? JSON.parse(tags)
        : tags
      : []

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      slug,
      author,
      categories: parsedCategories,
      tags: parsedTags,
      status: status || 'draft',
      visibility: visibility || 'public',
      password: visibility === 'password_protected' ? password : null,
      featuredImage,
      videoUrl,
      publishedAt: status === 'published' ? publishedAt || Date.now() : null,
      scheduledAt: scheduledAt || null,
      metaTitle,
      metaKeywords,
      metaDescription,
    })

    res.status(201).json({ success: true, message: 'Blog created successfully', blog })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL BLOGS ───────────────────────────────────
// GET /api/blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'firstName lastName email')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: blogs.length, blogs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET BLOG BY ID ──────────────────────────────────
// GET /api/blogs/:id
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'firstName lastName email')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    res.status(200).json({ success: true, blog })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET BLOG BY SLUG ────────────────────────────────
// GET /api/blogs/slug/:slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'firstName lastName email')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    res.status(200).json({ success: true, blog })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE BLOG ─────────────────────────────────────
// PUT /api/blogs/:id
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    const {
      title,
      excerpt,
      content,
      slug,
      author,
      categories,
      tags,
      status,
      visibility,
      password,
      videoUrl,
      publishedAt,
      scheduledAt,
      metaTitle,
      metaKeywords,
      metaDescription,
    } = req.body

    if (slug && slug !== blog.slug) {
      const existing = await Blog.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    if (req.file) {
      if (blog.featuredImage) {
        const publicId = 'cms/blogs/' + blog.featuredImage.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      blog.featuredImage = await uploadToCloudinary(req.file)
    }

    const parsedCategories = categories
      ? typeof categories === 'string'
        ? JSON.parse(categories)
        : categories
      : blog.categories

    const parsedTags = tags
      ? typeof tags === 'string'
        ? JSON.parse(tags)
        : tags
      : blog.tags

    blog.title = title || blog.title
    blog.excerpt = excerpt || blog.excerpt
    blog.content = content || blog.content
    blog.slug = slug || blog.slug
    blog.author = author || blog.author
    blog.categories = parsedCategories
    blog.tags = parsedTags
    blog.status = status || blog.status
    blog.visibility = visibility || blog.visibility
    blog.password = visibility === 'password_protected' ? password : null
    blog.videoUrl = videoUrl || blog.videoUrl
    blog.publishedAt = status === 'published' ? publishedAt || blog.publishedAt || Date.now() : blog.publishedAt
    blog.scheduledAt = scheduledAt || blog.scheduledAt
    blog.metaTitle = metaTitle || blog.metaTitle
    blog.metaKeywords = metaKeywords || blog.metaKeywords
    blog.metaDescription = metaDescription || blog.metaDescription

    await blog.save()

    res.status(200).json({ success: true, message: 'Blog updated successfully', blog })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE BLOG ─────────────────────────────────────
// DELETE /api/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    if (blog.featuredImage) {
      const publicId = 'cms/blogs/' + blog.featuredImage.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await blog.deleteOne()

    res.status(200).json({ success: true, message: 'Blog deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}