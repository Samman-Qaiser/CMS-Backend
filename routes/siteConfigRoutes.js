import express from 'express'
import {
  getSiteConfig,
  updateSiteConfig,
  deleteSliderImage,
} from '../controllers/siteConfigController.js'
import multer from 'multer'

const router = express.Router()

// Multiple fields k liye multer fields use karein ge
const upload = multer({ storage: multer.memoryStorage() })

const uploadFields = upload.fields([
  { name: 'favicon', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'logoIcon', maxCount: 1 },
  { name: 'homeSlider', maxCount: 10 },
])

router.get('/', getSiteConfig)
router.put('/', uploadFields, updateSiteConfig)
router.delete('/slider', deleteSliderImage)

export default router