import express from 'express'
import {
  createMenu,
  getAllMenus,
  getMenuById,
  getMenuByName,
  updateMenuName,
  deleteMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from '../controllers/menuController.js'

const router = express.Router()

// ─── Menu CRUD ───────────────────────────────────────
router.post('/', createMenu)
router.get('/', getAllMenus)
router.get('/name/:name', getMenuByName)
router.get('/:id', getMenuById)
router.put('/:id', updateMenuName)
router.delete('/:id', deleteMenu)

// ─── Menu Items ──────────────────────────────────────
router.post('/:id/items', addMenuItem)
router.put('/:id/items/:itemId', updateMenuItem)
router.delete('/:id/items/:itemId', deleteMenuItem)

// ─── Reorder ─────────────────────────────────────────
router.put('/:id/reorder', reorderMenuItems)

export default router