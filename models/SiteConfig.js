import mongoose from 'mongoose'

const siteConfigSchema = new mongoose.Schema(
  {
    favicon: {
      type: String,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    logoIcon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    homeSlider: {
      type: [String],
      default: [],
    },
    supportEmail: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('SiteConfig', siteConfigSchema)