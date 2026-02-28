import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const router = express.Router();

// Rate limit contact form to prevent spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many contact requests, please try again later',
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

// POST /api/contact — submit a contact form message
router.post('/', contactLimiter, validate(contactSchema), asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  logger.info('contact', `New contact message from ${email}: ${subject}`);

  // Send notification email to admin/support
  if (isEmailEnabled()) {
    const adminEmail = process.env.FROM_EMAIL || process.env.SUPPORT_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `[Contact Form] ${subject} — from ${name}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr/>
          <p style="font-size:12px;color:#888;">Sent from the Savatsya Gau Samvardhan contact form at ${new Date().toISOString()}</p>
        `,
      });
    }

    // Send acknowledgement to the user
    await sendEmail({
      to: email,
      subject: `We received your message — ${subject}`,
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for contacting Savatsya Gau Samvardhan. We have received your message and will get back to you within 2 business days.</p>
        <p>Best regards,<br/>Savatsya Gau Samvardhan Team</p>
      `,
    });
  }

  res.status(201).json({
    ok: true,
    message: 'Your message has been sent successfully. We will get back to you soon.',
  });
}));

export default router;
