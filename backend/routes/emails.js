import express from 'express';
import InboundEmail from '../models/InboundEmail.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all inbound emails (with pagination and filtering)
router.get('/', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const filter = {};
  
  if (req.query.emailType) filter.emailType = req.query.emailType;
  if (req.query.processed !== undefined) filter.processed = req.query.processed === 'true';
  if (req.query.from) filter.from = new RegExp(req.query.from, 'i');
  if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
  
  if (req.query.startDate || req.query.endDate) {
    filter.receivedAt = {};
    if (req.query.startDate) filter.receivedAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.receivedAt.$lte = new Date(req.query.endDate);
  }
  
  const [emails, total] = await Promise.all([
    InboundEmail.find(filter)
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InboundEmail.countDocuments(filter)
  ]);
  
  res.json({
    emails,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filter
  });
}));

// Get email statistics
router.get('/stats', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const [
    totalEmails,
    unprocessedEmails,
    todayEmails,
    weekEmails,
    monthEmails,
    emailsByType,
    autoRepliesSent
  ] = await Promise.all([
    InboundEmail.countDocuments(),
    InboundEmail.countDocuments({ processed: false }),
    InboundEmail.countDocuments({ receivedAt: { $gte: today } }),
    InboundEmail.countDocuments({ receivedAt: { $gte: thisWeek } }),
    InboundEmail.countDocuments({ receivedAt: { $gte: thisMonth } }),
    InboundEmail.aggregate([
      { $group: { _id: '$emailType', count: { $sum: 1 } } }
    ]),
    InboundEmail.countDocuments({ autoReplySent: true })
  ]);
  
  res.json({
    totalEmails,
    unprocessedEmails,
    todayEmails,
    weekEmails,
    monthEmails,
    emailsByType: emailsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    autoRepliesSent,
    emailEnabled: isEmailEnabled()
  });
}));

// Get single email by ID
router.get('/:id', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const email = await InboundEmail.findById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  res.json(email);
}));

// Mark email as processed
router.patch('/:id/process', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const email = await InboundEmail.findById(req.params.id);
  
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  
  await email.markProcessed(notes);
  res.json({ message: 'Email marked as processed', email });
}));

// Send manual reply to an email
router.post('/:id/reply', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const { subject, html, text } = req.body;
  const email = await InboundEmail.findById(req.params.id);
  
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  
  if (!isEmailEnabled()) {
    return res.status(400).json({ error: 'Email service not configured' });
  }
  
  const replyResult = await sendEmail({
    to: email.from,
    subject: subject || `Re: ${email.subject}`,
    html,
    text
  });
  
  if (replyResult.ok) {
    email.metadata.manualReply = {
      sentAt: new Date(),
      subject,
      messageId: replyResult.messageId,
      sentBy: req.user.userId
    };
    await email.save();
    
    res.json({
      message: 'Reply sent successfully',
      messageId: replyResult.messageId
    });
  } else {
    res.status(500).json({
      error: 'Failed to send reply',
      details: replyResult.error
    });
  }
}));

// Update email classification
router.patch('/:id/classify', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const { emailType, notes } = req.body;
  
  const validTypes = ['support', 'contact', 'unsubscribe', 'order_inquiry', 'general', 'spam'];
  if (!validTypes.includes(emailType)) {
    return res.status(400).json({ error: 'Invalid email type' });
  }
  
  const email = await InboundEmail.findByIdAndUpdate(
    req.params.id,
    { 
      emailType,
      notes: notes || undefined,
      'metadata.classifiedBy': req.user.userId,
      'metadata.classifiedAt': new Date()
    },
    { new: true }
  );
  
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  
  res.json({ message: 'Email classified successfully', email });
}));

// Delete email (admin only, for spam/unwanted emails)
router.delete('/:id', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const email = await InboundEmail.findByIdAndDelete(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }
  res.json({ message: 'Email deleted successfully' });
}));

// Bulk operations
router.post('/bulk/process', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const { emailIds, notes } = req.body;
  
  if (!Array.isArray(emailIds) || emailIds.length === 0) {
    return res.status(400).json({ error: 'Email IDs array required' });
  }
  
  const result = await InboundEmail.updateMany(
    { _id: { $in: emailIds } },
    { 
      processed: true,
      processedAt: new Date(),
      notes: notes || '',
      'metadata.bulkProcessedBy': req.user.userId
    }
  );
  
  res.json({
    message: 'Emails processed successfully',
    processedCount: result.modifiedCount
  });
}));

export default router;