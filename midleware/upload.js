// middleware/upload.js
import multer from 'multer'

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = {
      'image/jpeg': true, 'image/png': true, 'image/gif': true,
      'image/webp': true, 'image/svg+xml': true,
      'video/mp4': true, 'video/mpeg': true, 'video/quicktime': true,
      'video/x-msvideo': true, 'video/webm': true, 'video/ogg': true,
      'audio/mpeg': true, 'audio/mp3': true, 'audio/wav': true,
      'audio/ogg': true, 'audio/aac': true, 'audio/flac': true,
      // Chat ke liye add karo
      'application/pdf': true,
      'application/msword': true,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    }
    allowedMimeTypes[file.mimetype] ? cb(null, true) : cb(new Error('File type not allowed'), false)
  },
})

export default upload