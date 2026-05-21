import Contact from '../models/Contact.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── CREATE CONTACT ──────────────────────────────────
// POST /api/contacts
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' })
    }

    const contact = await Contact.create({ name, email, phone, message })

    // Admin ko notification email bhejo
    await resend.emails.send({
      from: 'CMS <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })

    res.status(201).json({ success: true, message: 'Message sent successfully', contact })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL CONTACTS ────────────────────────────────
// GET /api/contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })

    res.status(200).json({ success: true, total: contacts.length, contacts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET CONTACT BY ID ───────────────────────────────
// GET /api/contacts/:id
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' })
    }

    res.status(200).json({ success: true, contact })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE CONTACT STATUS ───────────────────────────
// PUT /api/contacts/:id
export const updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' })
    }

    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' })
    }

    contact.status = status
    await contact.save()

    res.status(200).json({ success: true, message: 'Contact status updated', contact })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE CONTACT ──────────────────────────────────
// DELETE /api/contacts/:id
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' })
    }

    await contact.deleteOne()

    res.status(200).json({ success: true, message: 'Contact deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}