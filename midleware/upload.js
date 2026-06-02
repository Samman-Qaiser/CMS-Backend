// middleware/upload.js
import multer from 'multer'

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for video/audio
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and audio files
    const allowedMimeTypes = {
      // Images
      'image/jpeg': true,
      'image/png': true,
      'image/gif': true,
      'image/webp': true,
      'image/svg+xml': true,
      // Videos
      'video/mp4': true,
      'video/mpeg': true,
      'video/quicktime': true,
      'video/x-msvideo': true,
      'video/webm': true,
      'video/ogg': true,
      // Audio
      'audio/mpeg': true,
      'audio/mp3': true,
      'audio/wav': true,
      'audio/ogg': true,
      'audio/aac': true,
      'audio/flac': true
    }
    
    if (allowedMimeTypes[file.mimetype]) {
      cb(null, true)
    } else {
      cb(new Error('Only images, videos, and audio files are allowed'), false)
    }
  },
})

export default upload