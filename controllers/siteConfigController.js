import SiteConfig from '../models/SiteConfig.js'
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

// ─── GET SITE CONFIG ─────────────────────────────────
// GET /api/site-config
export const getSiteConfig = async (req, res) => {
  try {
    let config = await SiteConfig.findOne()

    // Agar config nahi hai toh empty banao
    if (!config) {
      config = await SiteConfig.create({})
    }

    res.status(200).json({ success: true, config })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE SITE CONFIG ──────────────────────────────
// PUT /api/site-config
export const updateSiteConfig = async (req, res) => {
  try {
    let config = await SiteConfig.findOne()

    if (!config) {
      config = await SiteConfig.create({})
    }

    const { title, supportEmail } = req.body

    // Single images
    if (req.files?.favicon) {
      if (config.favicon) {
        const publicId = 'cms/favicon/' + config.favicon.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      config.favicon = await uploadToCloudinary(req.files.favicon[0], 'favicon')
    }

    if (req.files?.logo) {
      if (config.logo) {
        const publicId = 'cms/logo/' + config.logo.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      config.logo = await uploadToCloudinary(req.files.logo[0], 'logo')
    }

    if (req.files?.logoIcon) {
      if (config.logoIcon) {
        const publicId = 'cms/logoIcon/' + config.logoIcon.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
      config.logoIcon = await uploadToCloudinary(req.files.logoIcon[0], 'logoIcon')
    }

    // Home Slider — multiple images
    if (req.files?.homeSlider) {
      const newSliderImages = await Promise.all(
        req.files.homeSlider.map((file) => uploadToCloudinary(file, 'slider'))
      )
      config.homeSlider = [...config.homeSlider, ...newSliderImages]
    }

    config.title = title || config.title
    config.supportEmail = supportEmail || config.supportEmail

    await config.save()

    res.status(200).json({ success: true, message: 'Site config updated successfully', config })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE SLIDER IMAGE ─────────────────────────────
// DELETE /api/site-config/slider
export const deleteSliderImage = async (req, res) => {
  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' })
    }

    const config = await SiteConfig.findOne()

    if (!config) {
      return res.status(404).json({ success: false, message: 'Config not found' })
    }

    // Cloudinary se delete karo
    const publicId = 'cms/slider/' + imageUrl.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(publicId)

    // Array se remove karo
    config.homeSlider = config.homeSlider.filter((img) => img !== imageUrl)
    await config.save()

    res.status(200).json({ success: true, message: 'Slider image deleted successfully', config })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}