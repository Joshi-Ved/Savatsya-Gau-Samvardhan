import express from 'express';
import Subscriber from '../models/Subscriber.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import { sendNewsletterSubscriptionEmail } from '../utils/emailTemplates.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();


router.post('/subscribe', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const normalized = String(email).toLowerCase().trim();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Check if already subscribed
  const existing = await Subscriber.findOne({ email: normalized });
  if (existing) {
    return res.json({ 
      ok: true, 
      message: 'Already subscribed',
      emailEnabled: isEmailEnabled()
    });
  }
  
  // Create new subscription
  await Subscriber.create({ email: normalized });
  logger.info('newsletter', `New subscription: ${normalized}`);
  
  // Check if email is enabled before attempting to send
  if (!isEmailEnabled()) {
    logger.warn('newsletter', 'Email not enabled, skipping welcome email');
    return res.status(201).json({
      ok: true,
      message: 'Subscribed successfully',
      emailEnabled: false,
      email: { sent: false, error: 'Email service not configured' }
    });
  }
  
  // Send newsletter subscription confirmation email
  const emailResult = await sendNewsletterSubscriptionEmail(normalized, 'Valued Subscriber');
  
  if (emailResult && emailResult.ok) {
    logger.info('newsletter', 'Welcome email sent', { to: normalized });
  } else {
    logger.error('newsletter', 'Welcome email failed', { to: normalized, error: emailResult?.error });
  }
  
  const response = { 
    ok: true, 
    message: 'Subscribed successfully',
    emailEnabled: isEmailEnabled()
  };
  
  if (emailResult) {
    response.email = { 
      sent: Boolean(emailResult.ok), 
      details: emailResult 
    };
  }
  
  return res.status(201).json(response);
}));

// Test endpoint for email functionality (admin only)
router.post('/test-email', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Test email address required' });
  }
  
  if (!isEmailEnabled()) {
    return res.status(400).json({ 
      error: 'Email service not enabled',
      emailEnabled: false
    });
  }
  
  const testResult = await sendEmail({
    to: email,
    subject: 'Test Email from Savatsya Gau Samvardhan',
    html: `
      <h2>Email Test Successful!</h2>
      <p>This is a test email from your Savatsya Gau Samvardhan backend.</p>
      <p>If you received this, your email configuration is working correctly.</p>
      <p>Sent at: ${new Date().toLocaleString()}</p>
    `,
    text: 'Email test successful! Your email configuration is working.'
  });
  
  res.json({
    success: true,
    emailEnabled: true,
    testResult,
    message: testResult.ok ? 'Test email sent successfully' : 'Test email failed'
  });
}));

// POST /api/newsletter/unsubscribe — unsubscribe via token
router.post('/unsubscribe', asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  
  let subscriber;
  if (token) {
    subscriber = await Subscriber.findOne({ unsubscribeToken: token, isActive: true });
  } else if (email) {
    const normalized = String(email).toLowerCase().trim();
    subscriber = await Subscriber.findOne({ email: normalized, isActive: true });
  }

  if (!subscriber) {
    return res.status(404).json({ error: 'Subscription not found or already unsubscribed' });
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  
  logger.info('newsletter', `Unsubscribed: ${subscriber.email}`);

  res.json({
    ok: true,
    message: 'You have been successfully unsubscribed from our newsletter.'
  });
}));

// GET /api/newsletter/unsubscribe/:token — unsubscribe via link in email
router.get('/unsubscribe/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const subscriber = await Subscriber.findOne({ unsubscribeToken: token, isActive: true });

  if (!subscriber) {
    return res.status(404).json({ error: 'Subscription not found or already unsubscribed' });
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  
  logger.info('newsletter', `Unsubscribed via link: ${subscriber.email}`);

  // Return a simple HTML page for link-based unsubscribes
  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:50px;">
      <h2>Unsubscribed Successfully</h2>
      <p>You have been removed from the Savatsya Gau Samvardhan newsletter.</p>
      <p>We're sorry to see you go!</p>
    </body></html>
  `);
}));

export default router;


