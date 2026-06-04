import Product from '../models/Product.js'
import ProductReview from '../models/ProductReview.js'
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

// ─── CREATE PRODUCT ──────────────────────────────────
// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      productCode,
      brand,
      category,
      price,
      originalPrice,
      sizes,
      tags,
      stock,
      availability,
      isFeatured,
    } = req.body

    if (!title || !slug || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, slug, category and price are required',
      })
    }

    const existing = await Product.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    // Multiple images upload
    let images = []
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file, 'products'))
      )
    }

    // Parse arrays
    const parsedSizes = sizes
      ? typeof sizes === 'string' ? JSON.parse(sizes) : sizes
      : []

    const parsedTags = tags
      ? typeof tags === 'string' ? JSON.parse(tags) : tags
      : []

    // Auto generate product code
    const autoCode = productCode ||
      `PRD${Date.now().toString().slice(-7)}`

    const product = await Product.create({
      title,
      slug,
      description,
      productCode: autoCode,
      brand,
      category,
      price,
      originalPrice: originalPrice || price,
      images,
      sizes: parsedSizes,
      tags: parsedTags,
      stock: stock || 0,
      availability: availability || 'in_stock',
      isFeatured: isFeatured === 'true' || isFeatured === true || false,
    })

    res.status(201).json({ success: true, message: 'Product created successfully', product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL PRODUCTS ────────────────────────────────
// GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { title: { $regex: req.query.search, $options: 'i' } }
      : {}

    const categoryFilter = req.query.category ? { category: req.query.category } : {}
    const availabilityFilter = req.query.availability ? { availability: req.query.availability } : {}
    const featuredFilter = req.query.featured ? { isFeatured: req.query.featured === 'true' } : {}
    const brandFilter = req.query.brand ? { brand: req.query.brand } : {}

    // Price filter
    const priceFilter = {}
    if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice)

    const filters = {
      ...keyword,
      ...categoryFilter,
      ...availabilityFilter,
      ...featuredFilter,
      ...brandFilter,
      ...(Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}),
    }

    // Pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 12
    const skip = (page - 1) * limit

    const total = await Product.countDocuments(filters)
    const products = await Product.find(filters)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET PRODUCT BY ID ───────────────────────────────
// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Reviews bhi lao
    const reviews = await ProductReview.find({
      product: product._id,
      status: 'approved',
    }).populate('user', 'firstName lastName profileImage')

    res.status(200).json({ success: true, product, reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET PRODUCT BY SLUG ─────────────────────────────
// GET /api/products/slug/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const reviews = await ProductReview.find({
      product: product._id,
      status: 'approved',
    }).populate('user', 'firstName lastName profileImage')

    res.status(200).json({ success: true, product, reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE PRODUCT ──────────────────────────────────
// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const {
      title,
      slug,
      description,
      productCode,
      brand,
      category,
      price,
      originalPrice,
      sizes,
      tags,
      stock,
      availability,
      isFeatured,
      isActive,
      removeImages, // URLs to remove
    } = req.body

    if (slug && slug !== product.slug) {
      const existing = await Product.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    // Remove specific images
    if (removeImages) {
      const imagesToRemove = typeof removeImages === 'string'
        ? JSON.parse(removeImages)
        : removeImages

      for (const imageUrl of imagesToRemove) {
        const publicId = 'cms/products/' + imageUrl.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }

      product.images = product.images.filter(
        (img) => !imagesToRemove.includes(img)
      )
    }

    // New images upload
    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file, 'products'))
      )
      product.images = [...product.images, ...newImages]
    }

    // Parse arrays
    const parsedSizes = sizes
      ? typeof sizes === 'string' ? JSON.parse(sizes) : sizes
      : product.sizes

    const parsedTags = tags
      ? typeof tags === 'string' ? JSON.parse(tags) : tags
      : product.tags

    product.title = title || product.title
    product.slug = slug || product.slug
    product.description = description || product.description
    product.productCode = productCode || product.productCode
    product.brand = brand || product.brand
    product.category = category || product.category
    product.price = price !== undefined ? price : product.price
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice
    product.sizes = parsedSizes
    product.tags = parsedTags
    product.stock = stock !== undefined ? stock : product.stock
    product.availability = availability || product.availability
    product.isFeatured = isFeatured !== undefined
      ? isFeatured === 'true' || isFeatured === true
      : product.isFeatured
    product.isActive = isActive !== undefined ? isActive : product.isActive

    await product.save()

    res.status(200).json({ success: true, message: 'Product updated successfully', product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE PRODUCT ──────────────────────────────────
// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Sab images delete karo
    for (const imageUrl of product.images) {
      const publicId = 'cms/products/' + imageUrl.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await product.deleteOne()

    res.status(200).json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── PRODUCT REVIEW ──────────────────────────────────
// POST /api/products/:id/reviews
export const createProductReview = async (req, res) => {
  try {
    const { user, rating, comment } = req.body

    if (!user || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'User, rating and comment are required' })
    }

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    // Already reviewed?
    const existing = await ProductReview.findOne({ product: req.params.id, user })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' })
    }

    const review = await ProductReview.create({
      product: req.params.id,
      user,
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
// GET /api/products/reviews/all
export const getAllProductReviews = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {}
    const productFilter = req.query.product ? { product: req.query.product } : {}

    const reviews = await ProductReview.find({ ...statusFilter, ...productFilter })
      .populate('user', 'firstName lastName profileImage email')
      .populate('product', 'title slug images')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: reviews.length, reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE REVIEW STATUS ────────────────────────────
// PUT /api/products/reviews/:reviewId
export const updateProductReviewStatus = async (req, res) => {
  try {
    const review = await ProductReview.findById(req.params.reviewId)

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    const { status } = req.body
    review.status = status
    await review.save()

    // Product rating update karo
    const approvedReviews = await ProductReview.find({
      product: review.product,
      status: 'approved',
    })

    if (approvedReviews.length > 0) {
      const avgRating = approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length
      await Product.findByIdAndUpdate(review.product, {
        rating: avgRating.toFixed(1),
        totalReviews: approvedReviews.length,
      })
    }

    res.status(200).json({ success: true, message: 'Review status updated', review })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}