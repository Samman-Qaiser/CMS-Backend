import Comment from '../models/Comments.js'

// ─── CREATE COMMENT ──────────────────────────────────
// POST /api/comments
export const createComment = async (req, res) => {
  try {
    const { blog, name, email, content } = req.body

    if (!blog || !name || !email || !content) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    const comment = await Comment.create({
      blog,
      name,
      email,
      content,
      status: 'pending',
    })

    res.status(201).json({ success: true, message: 'Comment submitted successfully', comment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL COMMENTS ────────────────────────────────
// GET /api/comments
export const getAllComments = async (req, res) => {
  try {
    // Filter by status
    const statusFilter = req.query.status ? { status: req.query.status } : {}

    // Filter by blog
    const blogFilter = req.query.blog ? { blog: req.query.blog } : {}

    const comments = await Comment.find({ ...statusFilter, ...blogFilter })
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: comments.length, comments })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET COMMENT BY ID ───────────────────────────────
// GET /api/comments/:id
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('blog', 'title slug')

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    res.status(200).json({ success: true, comment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE COMMENT STATUS ───────────────────────────
// PUT /api/comments/:id
export const updateCommentStatus = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' })
    }

    const validStatuses = ['approved', 'pending', 'spam', 'trash']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    comment.status = status
    await comment.save()

    res.status(200).json({ success: true, message: 'Comment status updated successfully', comment })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE COMMENT ──────────────────────────────────
// DELETE /api/comments/:id
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    await comment.deleteOne()

    res.status(200).json({ success: true, message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}