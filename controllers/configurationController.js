import Configuration from '../models/Configuration.js'
// ─── CREATE CONFIGURATION ────────────────────────────
// POST /api/configurations
export const createConfiguration = async (req, res) => {
  try {
    const { name, value, title, inputType, description, params, isEditable, category } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }

    const existing = await Configuration.findOne({ name })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Configuration already exists' })
    }

    const configuration = await Configuration.create({
      name,
      value,
      title,
      inputType: inputType || 'text',
      description,
      params,
      isEditable: isEditable !== undefined ? isEditable : true,
      category: category || 'misc',
    })

    res.status(201).json({ success: true, message: 'Configuration created successfully', configuration })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL CONFIGURATIONS ──────────────────────────
// GET /api/configurations
export const getAllConfigurations = async (req, res) => {
  try {
    const categoryFilter = req.query.category ? { category: req.query.category } : {}

    const configurations = await Configuration.find(categoryFilter).sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: configurations.length, configurations })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET CONFIGURATION BY ID ─────────────────────────
// GET /api/configurations/:id
export const getConfigurationById = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id)

    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' })
    }

    res.status(200).json({ success: true, configuration })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE CONFIGURATION ────────────────────────────
// PUT /api/configurations/:id
export const updateConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id)

    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' })
    }

    if (!configuration.isEditable) {
      return res.status(403).json({ success: false, message: 'This configuration is not editable' })
    }

    const { value, title, inputType, description, params, isEditable, category } = req.body

    configuration.value = value !== undefined ? value : configuration.value
    configuration.title = title || configuration.title
    configuration.inputType = inputType || configuration.inputType
    configuration.description = description || configuration.description
    configuration.params = params || configuration.params
    configuration.isEditable = isEditable !== undefined ? isEditable : configuration.isEditable
    configuration.category = category || configuration.category

    await configuration.save()

    res.status(200).json({ success: true, message: 'Configuration updated successfully', configuration })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE CONFIGURATION ────────────────────────────
// DELETE /api/configurations/:id
export const deleteConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id)

    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' })
    }

    await configuration.deleteOne()

    res.status(200).json({ success: true, message: 'Configuration deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}