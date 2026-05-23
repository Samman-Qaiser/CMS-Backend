import {User} from '../models/User.js'
import Instructor from '../models/Instructor.js'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import { cloudinary } from '../config/cloudinary.js'


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
// ─── ADD USER (Admin) ─────────────────────────
// ───────
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



const resend = new Resend(process.env.RESEND_API_KEY)

// ─── APPLY FOR INSTRUCTOR ─────────────────────────
// POST /api/users/apply-instructor
export const applyForInstructor = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Already instructor hai?
    if (user.role === 'instructor') {
      return res.status(400).json({ success: false, message: 'You are already an instructor' })
    }

    // Already pending hai?
    if (user.instructorStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Your application is already pending' })
    }

    user.instructorStatus = 'pending'
    await user.save()

    // Admin ko email notification
    await resend.emails.send({
      from: 'CMS <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Instructor Application from ${user.firstName} ${user.lastName}`,
      html: `
        <h2>New Instructor Application</h2>
        <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Username:</strong> ${user.username}</p>
        <p>Please login to admin dashboard to review this application.</p>
      `,
    })

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully. Please wait for admin approval.',
      user: {
        id: user._id,
        instructorStatus: user.instructorStatus,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── APPROVE / REJECT INSTRUCTOR ─────────────────
// PUT /api/users/:id/instructor-status
export const updateInstructorStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' })
    }

    const validStatuses = ['approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.instructorStatus = status

    // Approve hone pe role instructor ho jaye
    if (status === 'approved') {
      user.role = 'instructor'

      // Instructor profile auto create karo
      const existingInstructor = await Instructor.findOne({ user: user._id })
      if (!existingInstructor) {
        await Instructor.create({
          user: user._id,
          isVerified: true,
          isActive: true,
        })
      }

      // User ko approval email
      await resend.emails.send({
        from: 'CMS <onboarding@resend.dev>',
        to: user.email,
        subject: 'Congratulations! Your Instructor Application is Approved',
        html: `
          <h2>Congratulations ${user.firstName}!</h2>
          <p>Your instructor application has been approved.</p>
          <p>You can now login and access your instructor dashboard.</p>
        `,
      })
    } else {
      // Reject hone pe email
      await resend.emails.send({
        from: 'CMS <onboarding@resend.dev>',
        to: user.email,
        subject: 'Instructor Application Status Update',
        html: `
          <h2>Hello ${user.firstName},</h2>
          <p>Unfortunately, your instructor application has been rejected.</p>
          <p>Please contact support for more information.</p>
        `,
      })
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: `Instructor application ${status} successfully`,
      user: {
        id: user._id,
        role: user.role,
        instructorStatus: user.instructorStatus,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
// ─── GET ALL INSTRUCTOR APPLICATIONS ─────────────
// GET /api/users/instructor-applications
export const getInstructorApplications = async (req, res) => {
  try {
    const applications = await User.find({
      instructorStatus: { $in: ['pending', 'approved', 'rejected'] }
    })
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ updatedAt: -1 })

    const total = await User.countDocuments({ instructorStatus: 'pending' })

    res.status(200).json({
      success: true,
      pendingCount: total,
      total: applications.length,
      applications,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}