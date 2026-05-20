import Tag from '../models/Tag.js'

// ─── CREATE TAG ──────────────────────────────────────
// POST /api/tags
export const createTag = async (req, res) => {
  try {
    const { name, slug } = req.body

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' })
    }

    const existing = await Tag.findOne({ slug })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' })
    }

    const tag = await Tag.create({ name, slug })

    res.status(201).json({ success: true, message: 'Tag created successfully', tag })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL TAGS ────────────────────────────────────
// GET /api/tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: tags.length, tags })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET TAG BY ID ───────────────────────────────────
// GET /api/tags/:id
export const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' })
    }

    res.status(200).json({ success: true, tag })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE TAG ──────────────────────────────────────
// PUT /api/tags/:id
export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' })
    }

    const { name, slug } = req.body

    if (slug && slug !== tag.slug) {
      const existing = await Tag.findOne({ slug })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug already exists' })
      }
    }

    tag.name = name || tag.name
    tag.slug = slug || tag.slug

    await tag.save()

    res.status(200).json({ success: true, message: 'Tag updated successfully', tag })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE TAG ──────────────────────────────────────
// DELETE /api/tags/:id
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' })
    }

    await tag.deleteOne()

    res.status(200).json({ success: true, message: 'Tag deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}