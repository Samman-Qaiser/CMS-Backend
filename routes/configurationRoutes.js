import express from 'express'
import {
  createConfiguration,
  getAllConfigurations,
  getConfigurationById,
  updateConfiguration,
  deleteConfiguration,
} from '../controllers/configurationController.js'

const router = express.Router()

router.post('/', createConfiguration)
router.get('/', getAllConfigurations)
router.get('/:id', getConfigurationById)
router.put('/:id', updateConfiguration)
router.delete('/:id', deleteConfiguration)

export default router