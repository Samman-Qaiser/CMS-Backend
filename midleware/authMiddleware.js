// middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import {User} from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('decoded:', decoded) // <-- yeh add karo temporarily
    req.user = await User.findById(decoded.id).select('-password')
    console.log('req.user:', req.user) // <-- yeh bhi
    next()
  } catch (err) {
    console.log('JWT Error:', err.message) // <-- error detail dekhne ke liye
    return res.status(401).json({ success: false, message: err.message }) // <-- exact error dikhao
  }
}