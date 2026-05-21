import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── SEND EMAIL ──────────────────────────────────────
// POST /api/emails/send
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'To, subject and message are required' })
    }

    await resend.emails.send({
      from: 'CMS <onboarding@resend.dev>',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>${message}</p>
        </div>
      `,
    })

    res.status(200).json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}