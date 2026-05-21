import express from 'express'
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js'

const router = express.Router()

router.post('/', createContact)
router.get('/', getAllContacts)
router.get('/:id', getContactById)
router.put('/:id', updateContactStatus)
router.delete('/:id', deleteContact)

export default router