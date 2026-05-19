import {User} from '../models/User.js'
import cloudinary from '../config/cloudinary.js'
import bcrypt from 'bcryptjs'



// ─── Helper: Cloudinary Upload ───────────────────────
const uploadToCloudinary = async (file) => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'cms/users',
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  })
  return result.secure_url
}
// ─── ADD USER (Admin) ────────────────────────────────
// POST /api/users/add
export const addUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      phoneNumber,
      gender,
      dateOfBirth,
      facebookUrl,
      twitterUrl,
      linkedinUrl,
      about,
      isActive,
    } = req.body

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' })
    }

    // Email ya username already exist?
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already exists' })
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 12)

    // Profile image — cloudinary se url aayega
   let profileImage = null
if (req.file) {
  profileImage = await uploadToCloudinary(req.file)
}

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phoneNumber,
      gender,
      dateOfBirth,
      facebookUrl,
      twitterUrl,
      linkedinUrl,
      about,
      isActive: isActive !== undefined ? isActive : true,
      profileImage,
    })

    res.status(201).json({
      success: true,
      message: 'User added successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL USERS ───────────────────────────────────
// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    // Password nahi aayega — select se hata diya
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire')

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET SINGLE USER ─────────────────────────────────
// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE USER ─────────────────────────────────────
// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const {
      firstName,
      lastName,
      username,
      email,
      role,
      phoneNumber,
      gender,
      dateOfBirth,
      facebookUrl,
      twitterUrl,
      linkedinUrl,
      about,
      isActive,
    } = req.body

    if (req.file) {
  // Purani image delete karo
  if (user.profileImage) {
    const publicId = 'cms/users/' + user.profileImage.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(publicId)
  }
  user.profileImage = await uploadToCloudinary(req.file)
}

    // Fields update karo
    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.username = username || user.username
    user.email = email || user.email
    user.role = role || user.role
    user.phoneNumber = phoneNumber || user.phoneNumber
    user.gender = gender || user.gender
    user.dateOfBirth = dateOfBirth || user.dateOfBirth
    user.facebookUrl = facebookUrl || user.facebookUrl
    user.twitterUrl = twitterUrl || user.twitterUrl
    user.linkedinUrl = linkedinUrl || user.linkedinUrl
    user.about = about || user.about
    user.isActive = isActive !== undefined ? isActive : user.isActive

    await user.save()

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE USER ─────────────────────────────────────
// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Cloudinary se image bhi delete karo
    if (user.profileImage) {
      const publicId = user.profileImage.split('/').slice(-2).join('/').split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}