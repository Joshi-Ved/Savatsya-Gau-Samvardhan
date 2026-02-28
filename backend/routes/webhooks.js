import express from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import InboundEmail from '../models/InboundEmail.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// HTML escape utility to prevent XSS in email templates
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Configure multer for handling multipart/form-data from SendGrid inbound parse
const upload = multer();

// Webhook signature verification middleware
function verifyWebhookSignature(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    // If no secret configured, log warning but allow (for backward-compat)
    logger.warn('webhook', 'WEBHOOK_SECRET not configured — skipping signature verification');
    return next();
  }
  const signature = req.headers['x-webhook-signature'] || req.headers['x-twilio-email-event-webhook-signature'];
  if (!signature) {
    logger.warn('webhook', 'Missing webhook signature header');
    return res.status(403).json({ error: 'Missing webhook signature' });
  }
  // Simple HMAC verification
  const timestamp = req.headers['x-webhook-timestamp'] || '';
  const payload = timestamp + JSON.stringify(req.body || '');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
    logger.warn('webhook', 'Invalid webhook signature');
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }
  next();
}

// SendGrid Inbound Parse Webhook
router.post('/sendgrid/inbound', upload.none(), verifyWebhookSignature, asyncHandler(async (req, res) => {
  logger.info('webhook', 'Received inbound email from SendGrid');
  
  // Extract email data from SendGrid inbound parse
  const emailData = {
    to: req.body.to,
    from: req.body.from,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
    cc: req.body.cc,
    attachments: req.body.attachments || 0,
    spf: req.body.SPF,
    envelope: JSON.stringify({
      to: req.body.envelope ? JSON.parse(req.body.envelope).to : [],
      from: req.body.envelope ? JSON.parse(req.body.envelope).from : req.body.from
    })
  };

  logger.info('webhook', `Email from: ${emailData.from}, subject: ${emailData.subject}`);

  // Save to database
  const inboundEmail = new InboundEmail({
    ...emailData,
    receivedAt: new Date(),
    processed: false
  });
  await inboundEmail.save();

  // Process different types of emails
  await processInboundEmail(emailData);

  res.status(200).json({ 
    ok: true, 
    message: 'Email processed successfully',
    emailId: inboundEmail._id 
  });
}));

// Process inbound email based on type and content
async function processInboundEmail(emailData) {
  const { from, to, subject, text, html } = emailData;
  const emailBody = text || html || '';
  
  try {
    if (to.includes('support@') || to.includes('help@')) {
      await handleSupportEmail(from, subject, emailBody);
    }
    
    if (emailBody.toLowerCase().includes('unsubscribe') && 
        (subject.toLowerCase().includes('unsubscribe') || emailBody.toLowerCase().includes('stop'))) {
      await handleUnsubscribeRequest(from);
    }
    
    const orderIdMatch = emailBody.match(/order[:\s#]*([a-f0-9]{24})/i);
    if (orderIdMatch) {
      await handleOrderInquiry(from, orderIdMatch[1], emailBody);
    }
    
    if (to.includes('contact@') || to.includes('info@')) {
      await handleContactEmail(from, subject, emailBody);
    }

  } catch (processError) {
    logger.error('webhook', 'Email processing error', { error: processError.message });
  }
}

// Handle support email with auto-reply
async function handleSupportEmail(fromEmail, subject, body) {
  if (!isEmailEnabled()) return;
  
  const autoReply = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Thank you for contacting Savatsya Gau Samvardhan Support</h2>
      <p>Dear Customer,</p>
      <p>We have received your support request and will respond within 24 hours during business days.</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>Your Message:</strong><br>
        ${escapeHtml(body.substring(0, 500))}${body.length > 500 ? '...' : ''}
      </div>
      
      <p>For urgent matters, please call us at ${escapeHtml(process.env.SUPPORT_PHONE || 'our support line')}</p>
      <p>Thank you for choosing Savatsya Gau Samvardhan!</p>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated response. Please do not reply to this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: fromEmail,
    subject: `Re: ${subject} - Support Request Received`,
    html: autoReply
  });

  logger.info('webhook', `Support auto-reply sent to: ${fromEmail}`);
}

// Handle newsletter unsubscribe requests
async function handleUnsubscribeRequest(fromEmail) {
  try {
    const { default: Subscriber } = await import('../models/Subscriber.js');
    
    await Subscriber.findOneAndDelete({ email: fromEmail.toLowerCase() });
    
    if (isEmailEnabled()) {
      await sendEmail({
        to: fromEmail,
        subject: 'Unsubscribed from Savatsya Gau Samvardhan Newsletter',
        html: `
          <p>You have been successfully unsubscribed from our newsletter.</p>
          <p>We're sorry to see you go. If this was a mistake, you can resubscribe on our website.</p>
        `
      });
    }
    
    logger.info('webhook', `Unsubscribed: ${fromEmail}`);
  } catch (error) {
    logger.error('webhook', 'Unsubscribe error', { error: error.message });
  }
}

// Handle order-related inquiries
async function handleOrderInquiry(fromEmail, orderId, body) {
  try {
    const { default: Order } = await import('../models/Order.js');
    
    const order = await Order.findById(orderId);
    
    if (isEmailEnabled()) {
      if (order) {
        await sendEmail({
          to: fromEmail,
          subject: `Order Status - ${orderId}`,
          html: `
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> ${order.status || 'Processing'}</p>
            <p><strong>Total:</strong> ₹${order.total}</p>
            <p><strong>Items:</strong> ${order.items?.length || 0} item(s)</p>
            
            <p>Our support team will contact you shortly for further assistance.</p>
          `
        });
      } else {
        await sendEmail({
          to: fromEmail,
          subject: `Order Inquiry - ${orderId}`,
          html: `
            <p>Thank you for your inquiry about order ${orderId}.</p>
            <p>We could not find this order in our system. Please verify the order ID or contact our support team.</p>
          `
        });
      }
    }
    
    logger.info('webhook', `Order inquiry response sent for: ${orderId}`);
  } catch (error) {
    logger.error('webhook', 'Order inquiry error', { error: error.message });
  }
}

// Handle general contact emails
async function handleContactEmail(fromEmail, subject, body) {
  if (!isEmailEnabled()) return;
  
  await sendEmail({
    to: fromEmail,
    subject: `Thank you for contacting us - ${subject}`,
    html: `
      <h3>Thank you for reaching out!</h3>
      <p>We have received your message and will get back to you within 2 business days.</p>
      
      <div style="background: #f9f9f9; padding: 10px; margin: 15px 0;">
        <strong>Your message:</strong><br>
        ${escapeHtml(body.substring(0, 300))}${body.length > 300 ? '...' : ''}
      </div>
      
      <p>Best regards,<br>Savatsya Gau Samvardhan Team</p>
    `
  });
  
  logger.info('webhook', `Contact auto-reply sent to: ${fromEmail}`);
}

// Generic webhook handler (for other services)
router.post('/incoming', express.raw({ type: '*/*' }), (req, res) => {
  try {
    let payload = req.body;
    try { payload = JSON.parse(req.body.toString()); } catch (e) {}
    logger.info('webhook', 'Received webhook', { type: payload?.type || 'raw' });
   
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error('webhook', 'Webhook handling error', { error: err.message });
    res.status(400).json({ ok: false, error: 'invalid payload' });
  }
});

export default router;
