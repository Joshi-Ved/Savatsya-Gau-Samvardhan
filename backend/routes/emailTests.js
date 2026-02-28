import express from 'express';
import {
  sendWelcomeEmail,
  sendNewsletterSubscriptionEmail,
  send2FAEnabledEmail,
  send2FADisabledEmail,
  sendDataDownloadEmail,
  sendAccountDeletionEmail
} from '../utils/emailTemplates.js';
import { diagnoseSendGridIssues, quickSendGridCheck } from '../utils/sendgridDiagnostics.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All email test routes require admin authentication
router.use(authenticateJWT, requireAdmin);

// SendGrid diagnosis endpoint
router.get('/diagnose-sendgrid', asyncHandler(async (req, res) => {
  logger.info('email-test', 'Starting SendGrid diagnosis');
  const diagnosis = await diagnoseSendGridIssues();
  const quickCheck = await quickSendGridCheck();

  return res.json({
    success: true,
    diagnosis: {
      hasIssues: diagnosis.hasIssues,
      issues: diagnosis.issues,
      recommendations: diagnosis.recommendations,
      quickStatus: quickCheck
    },
    timestamp: new Date().toISOString()
  });
}));

// Quick SendGrid status check
router.get('/sendgrid-status', asyncHandler(async (req, res) => {
  const status = await quickSendGridCheck();

  return res.json({
    success: true,
    status,
    environment: {
      apiKeyPresent: !!process.env.SENDGRID_API_KEY,
      apiKeyFormat: process.env.SENDGRID_API_KEY?.startsWith('SG.') || false,
      fromEmailPresent: !!process.env.FROM_EMAIL,
      fromEmailFormat: process.env.FROM_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.FROM_EMAIL)
    },
    timestamp: new Date().toISOString()
  });
}));

// Test all email templates
router.post('/test-all-emails', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Test email address is required' });
  }

  logger.info('email-test', `Testing all email templates for: ${email}`);

  const results = {};

  // Test each template, catching individual failures
  const templates = [
    { key: 'welcome', fn: () => sendWelcomeEmail(email, 'Test User') },
    { key: 'newsletter', fn: () => sendNewsletterSubscriptionEmail(email, 'Test User') },
    { key: 'twoFactorEnabled', fn: () => send2FAEnabledEmail(email, 'Test User', 'email') },
    { key: 'twoFactorDisabled', fn: () => send2FADisabledEmail(email, 'Test User') },
    { key: 'dataDownload', fn: () => sendDataDownloadEmail(email, 'Test User', new Date().toLocaleString()) },
    { key: 'accountDeletion', fn: () => sendAccountDeletionEmail(email, 'Test User', new Date().toLocaleString()) },
  ];

  for (const { key, fn } of templates) {
    try {
      results[key] = await fn();
    } catch (err) {
      results[key] = { ok: false, error: err.message };
    }
  }

  const successCount = Object.values(results).filter(r => r.ok).length;
  const totalCount = Object.keys(results).length;

  return res.json({
    success: true,
    message: `Email template test completed: ${successCount}/${totalCount} emails sent successfully`,
    results,
    summary: {
      total: totalCount,
      successful: successCount,
      failed: totalCount - successCount
    }
  });
}));

// Test individual email templates
router.post('/test-welcome', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = await sendWelcomeEmail(email, name || 'Test User');
  res.json({ success: true, result });
}));

router.post('/test-newsletter', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = await sendNewsletterSubscriptionEmail(email, name || 'Test User');
  res.json({ success: true, result });
}));

router.post('/test-2fa-enabled', asyncHandler(async (req, res) => {
  const { email, name, method } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = await send2FAEnabledEmail(email, name || 'Test User', method || 'email');
  res.json({ success: true, result });
}));

router.post('/test-2fa-disabled', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = await send2FADisabledEmail(email, name || 'Test User');
  res.json({ success: true, result });
}));

router.post('/test-data-download', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = await sendDataDownloadEmail(email, name || 'Test User', new Date().toLocaleString());
  res.json({ success: true, result });
}));

router.post('/test-account-deletion', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const result = await sendAccountDeletionEmail(email, name || 'Test User', new Date().toLocaleString());
  res.json({ success: true, result });
}));

export default router;