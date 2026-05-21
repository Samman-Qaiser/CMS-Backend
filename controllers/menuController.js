import Menu from '../models/Menu.js'

// ─── CREATE MENU ─────────────────────────────────────
// POST /api/menus
export const createMenu = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: 'Menu name is required' })
    }

    const existing = await Menu.findOne({ name })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Menu name already exists' })
    }

    const menu = await Menu.create({ name, items: [] })

    res.status(201).json({ success: true, message: 'Menu created successfully', menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL MENUS ───────────────────────────────────
// GET /api/menus
export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: menus.length, menus })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET MENU BY ID ──────────────────────────────────
// GET /api/menus/:id
export const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    res.status(200).json({ success: true, menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET MENU BY NAME ────────────────────────────────
// GET /api/menus/name/:name
export const getMenuByName = async (req, res) => {
  try {
    const menu = await Menu.findOne({ name: req.params.name })

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    res.status(200).json({ success: true, menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE MENU NAME ────────────────────────────────
// PUT /api/menus/:id
export const updateMenuName = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    const { name } = req.body

    if (name && name !== menu.name) {
      const existing = await Menu.findOne({ name })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Menu name already exists' })
      }
    }

    menu.name = name || menu.name
    await menu.save()

    res.status(200).json({ success: true, message: 'Menu updated successfully', menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE MENU ─────────────────────────────────────
// DELETE /api/menus/:id
export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    await menu.deleteOne()

    res.status(200).json({ success: true, message: 'Menu deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── ADD MENU ITEM ───────────────────────────────────
// POST /api/menus/:id/items
export const addMenuItem = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    const {
      type,
      referenceId,
      label,
      url,
      order,
      parent,
      titleAttribute,
      classAttribute,
      targetAttribute,
      description,
    } = req.body

    if (!type || !label) {
      return res.status(400).json({ success: false, message: 'Type and label are required' })
    }

    if (type === 'custom_link' && !url) {
      return res.status(400).json({ success: false, message: 'URL is required for custom link' })
    }

    if ((type === 'page' || type === 'blog') && !referenceId) {
      return res.status(400).json({ success: false, message: 'Reference ID is required for page or blog' })
    }

    const newItem = {
      type,
      referenceId: referenceId || null,
      label,
      url: url || null,
      order: order || menu.items.length,
      parent: parent || null,
      titleAttribute,
      classAttribute,
      targetAttribute: targetAttribute || '_self',
      description,
    }

    menu.items.push(newItem)
    await menu.save()

    res.status(201).json({ success: true, message: 'Menu item added successfully', menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE MENU ITEM ────────────────────────────────
// PUT /api/menus/:id/items/:itemId
export const updateMenuItem = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    const item = menu.items.id(req.params.itemId)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }

    const {
      label,
      url,
      order,
      parent,
      titleAttribute,
      classAttribute,
      targetAttribute,
      description,
    } = req.body

    item.label = label || item.label
    item.url = url || item.url
    item.order = order !== undefined ? order : item.order
    item.parent = parent || item.parent
    item.titleAttribute = titleAttribute || item.titleAttribute
    item.classAttribute = classAttribute || item.classAttribute
    item.targetAttribute = targetAttribute || item.targetAttribute
    item.description = description || item.description

    await menu.save()

    res.status(200).json({ success: true, message: 'Menu item updated successfully', menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE MENU ITEM ────────────────────────────────
// DELETE /api/menus/:id/items/:itemId
export const deleteMenuItem = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    const item = menu.items.id(req.params.itemId)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }

    item.deleteOne()
    await menu.save()

    res.status(200).json({ success: true, message: 'Menu item deleted successfully', menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── REORDER MENU ITEMS ──────────────────────────────
// PUT /api/menus/:id/reorder
export const reorderMenuItems = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    const { items } = req.body

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' })
    }

    // Har item ka order update karo
    items.forEach(({ itemId, order }) => {
      const item = menu.items.id(itemId)
      if (item) item.order = order
    })

    await menu.save()

    res.status(200).json({ success: true, message: 'Menu reordered successfully', menu })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}