import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINRY_NAME,
    api_key: process.env.CLOUDINRY_API_KEY,
    api_secret: process.env.CLOUDINRY_SECRET_KEY,
  })
}

export { cloudinary }
export default connectCloudinary