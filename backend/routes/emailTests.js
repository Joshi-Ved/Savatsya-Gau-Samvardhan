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

const router = express.Router();

// SendGrid diagnosis endpoint
router.get('/diagnose-sendgrid', async (req, res) => {
  try {
    console.log('\n🔍 Starting SendGrid Diagnosis...\n');
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

  } catch (error) {
    console.error('[sendgrid-diagnosis] Error:', error);
    return res.status(500).json({
      error: 'Diagnosis failed',
      details: error.message
    });
  }
});

// Quick SendGrid status check
router.get('/sendgrid-status', async (req, res) => {
  try {
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

  } catch (error) {
    return res.status(500).json({
      error: 'Status check failed',
      details: error.message
    });
  }
});

// Test all email templates
router.post('/test-all-emails', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Test email address is required' });
    }

    console.log('[email-test] Testing all email templates for:', email);

    const results = {};

    // Test welcome email
    try {
      results.welcome = await sendWelcomeEmail(email, 'Test User');
    } catch (err) {
      results.welcome = { ok: false, error: err.message };
    }

    // Test newsletter subscription
    try {
      results.newsletter = await sendNewsletterSubscriptionEmail(email, 'Test User');
    } catch (err) {
      results.newsletter = { ok: false, error: err.message };
    }

    // Test 2FA enabled
    try {
      results.twoFactorEnabled = await send2FAEnabledEmail(email, 'Test User', 'email');
    } catch (err) {
      results.twoFactorEnabled = { ok: false, error: err.message };
    }

    // Test 2FA disabled
    try {
      results.twoFactorDisabled = await send2FADisabledEmail(email, 'Test User');
    } catch (err) {
      results.twoFactorDisabled = { ok: false, error: err.message };
    }

    // Test data download
    try {
      results.dataDownload = await sendDataDownloadEmail(email, 'Test User', new Date().toLocaleString());
    } catch (err) {
      results.dataDownload = { ok: false, error: err.message };
    }

    // Test account deletion
    try {
      results.accountDeletion = await sendAccountDeletionEmail(email, 'Test User', new Date().toLocaleString());
    } catch (err) {
      results.accountDeletion = { ok: false, error: err.message };
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

  } catch (error) {
    console.error('[email-test] Test failed:', error);
    return res.status(500).json({
      error: 'Email test failed',
      details: error.message
    });
  }
});

// Test individual email templates
router.post('/test-welcome', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await sendWelcomeEmail(email, name || 'Test User');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-newsletter', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await sendNewsletterSubscriptionEmail(email, name || 'Test User');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-2fa-enabled', async (req, res) => {
  const { email, name, method } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await send2FAEnabledEmail(email, name || 'Test User', method || 'email');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-2fa-disabled', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await send2FADisabledEmail(email, name || 'Test User');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-data-download', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await sendDataDownloadEmail(email, name || 'Test User', new Date().toLocaleString());
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-account-deletion', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await sendAccountDeletionEmail(email, name || 'Test User', new Date().toLocaleString());
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;