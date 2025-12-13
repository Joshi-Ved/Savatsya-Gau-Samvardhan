import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateJWT } from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import {
  send2FAEnabledEmail,
  send2FADisabledEmail,
  sendDataDownloadEmail,
  sendAccountDeletionEmail
} from '../utils/emailTemplates.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


// GET /api/user/all - List all users (Admin only)
router.get('/all', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/me', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    email: user.email,
    userId: user._id,
    avatar: user.avatar || null,
    name: user.name,
    phone: user.phone,
    profilePicture: user.profilePicture,
    address: user.address || [],
    preferences: user.preferences || {},
    uiConfig: user.uiConfig || {},
    isAdmin: user.isAdmin || false,
    twoFactorAuth: {
      enabled: user.twoFactorAuth?.enabled || false,
      method: user.twoFactorAuth?.method || null,
      enabledAt: user.twoFactorAuth?.enabledAt || null,
      backupCodesAvailable: user.twoFactorAuth?.backupCodes?.filter(code => !code.used).length || 0
    }
  });
});

// Get current 2FA status
router.get('/two-factor/status', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const twoFactorStatus = {
      enabled: user.twoFactorAuth?.enabled || false,
      method: user.twoFactorAuth?.method || null,
      enabledAt: user.twoFactorAuth?.enabledAt || null,
      disabledAt: user.twoFactorAuth?.disabledAt || null,
      backupCodesAvailable: user.twoFactorAuth?.backupCodes?.filter(code => !code.used).length || 0,
      totalBackupCodes: user.twoFactorAuth?.backupCodes?.length || 0
    };

    return res.json({
      ok: true,
      twoFactorAuth: twoFactorStatus
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/profile', authenticateJWT, async (req, res) => {
  const { name, email, phone, avatar, profilePicture } = req.body;
  console.log(`Profile update request for user ${req.user.userId}:`, { name, email, phone, avatar: avatar ? 'provided' : 'not provided', profilePicture: profilePicture ? 'provided' : 'not provided' });

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (avatar !== undefined) updates.avatar = avatar;
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;

  console.log('Applying updates:', { ...updates, avatar: updates.avatar ? 'provided' : undefined, profilePicture: updates.profilePicture ? 'base64 data' : undefined });

  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
  console.log('Updated user profile:', { name: user.name, email: user.email, phone: user.phone, avatar: user.avatar ? 'saved' : 'none', profilePicture: user.profilePicture ? 'saved' : 'none' });

  return res.json({ ok: true, user });
});


router.post('/avatar', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(req.file.buffer);
    });
    const url = result.secure_url || result.url;
    const user = await User.findByIdAndUpdate(req.user.userId, { avatar: url }, { new: true }).lean();
    return res.json({ ok: true, url, user });
  } catch (err) {
    console.error('Avatar upload failed', err?.message || err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});


router.put('/preferences', authenticateJWT, async (req, res) => {
  const { preferences, uiConfig } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  if (uiConfig) user.uiConfig = { ...user.uiConfig, ...uiConfig };
  await user.save();
  return res.json({ ok: true });
});


router.post('/addresses', authenticateJWT, async (req, res) => {
  const addr = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (addr.isDefault) {
    user.address.forEach(a => a.isDefault = false);
  }
  user.address.push(addr);
  await user.save();
  return res.status(201).json({ ok: true });
});

router.put('/addresses/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.address = user.address.map(a => a.id === id ? { ...a.toObject(), ...updates } : a);
  if (updates.isDefault) {
    user.address.forEach(a => { if (a.id !== id) a.isDefault = false; });
  }
  await user.save();
  return res.json({ ok: true });
});

router.delete('/addresses/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.address = user.address.filter(a => a.id !== id);
  await user.save();
  return res.json({ ok: true });
});


router.put('/change-password', authenticateJWT, async (req, res) => {
  console.log('=== CHANGE PASSWORD REQUEST ===');
  console.log('User ID:', req.user?.userId);
  console.log('Request body keys:', Object.keys(req.body));

  try {
    const { currentPassword, newPassword } = req.body;
    console.log('Current password provided:', !!currentPassword);
    console.log('New password provided:', !!newPassword);
    console.log('New password length:', newPassword?.length);

    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.email);


    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    console.log('Current password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid current password');
      return res.status(400).json({ error: 'Current password is incorrect' });
    }


    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('New password hashed successfully');


    user.password = hashedNewPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    console.log('Password updated successfully');

    return res.json({
      ok: true,
      message: 'Password changed successfully',
      passwordChangedAt: user.passwordChangedAt
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/two-factor', authenticateJWT, async (req, res) => {
  console.log('=== TWO-FACTOR AUTH REQUEST ===');
  console.log('User ID:', req.user?.userId);
  console.log('Request body:', req.body);

  try {
    const { enable, method = 'email', password } = req.body;

    // Validate input
    if (enable === undefined || enable === null) {
      console.log('Missing enable parameter');
      return res.status(400).json({ error: 'Enable parameter is required (true or false)' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Current 2FA status:', user.twoFactorAuth?.enabled || false);
    console.log('Requested action:', enable ? 'enable' : 'disable');

    // For security, require password confirmation for enable, optional for disable
    if (enable && !password) {
      console.log('Password required for enabling 2FA');
      return res.status(400).json({ error: 'Password confirmation is required to enable 2FA' });
    }

    if (password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password provided');
        return res.status(400).json({ error: 'Password is incorrect' });
      }
      console.log('Password validated successfully');
    } else if (!enable) {
      console.log('Disabling 2FA without password confirmation (legacy support)');
    }

    if (enable) {
      // Enable 2FA
      console.log('Enabling 2FA with method:', method);

      // Validate method
      const validMethods = ['email', 'sms', 'app'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ error: 'Invalid method. Must be email, sms, or app' });
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      // Initialize twoFactorAuth if it doesn't exist
      if (!user.twoFactorAuth) {
        user.twoFactorAuth = {};
      }

      user.twoFactorAuth.enabled = true;
      user.twoFactorAuth.method = method;
      user.twoFactorAuth.backupCodes = backupCodes.map(code => ({ code, used: false }));
      user.twoFactorAuth.enabledAt = new Date();

      // Clear any previous disabled date
      if (user.twoFactorAuth.disabledAt) {
        user.twoFactorAuth.disabledAt = undefined;
      }

      await user.save();
      console.log('2FA enabled successfully');

      // Send 2FA enabled email notification
      try {
        console.log('[2FA] Sending 2FA enabled email to:', user.email);
        const emailResult = await send2FAEnabledEmail(user.email, user.name || 'Valued Customer', method);
        console.log('[2FA] Email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
      } catch (emailError) {
        console.error('[2FA] Email notification error:', emailError.message);
        // Don't fail the 2FA operation if email fails
      }

      return res.json({
        ok: true,
        message: 'Two-factor authentication enabled successfully',
        backupCodes,
        method,
        enabledAt: user.twoFactorAuth.enabledAt
      });
    } else {
      // Disable 2FA
      console.log('Disabling 2FA');

      // Check if 2FA is currently enabled
      if (!user.twoFactorAuth || !user.twoFactorAuth.enabled) {
        console.log('2FA is not currently enabled');
        return res.status(400).json({ error: 'Two-factor authentication is not currently enabled' });
      }

      // Initialize twoFactorAuth if it doesn't exist (shouldn't happen but safety check)
      if (!user.twoFactorAuth) {
        user.twoFactorAuth = {};
      }

      user.twoFactorAuth.enabled = false;
      user.twoFactorAuth.method = null;
      user.twoFactorAuth.backupCodes = [];
      user.twoFactorAuth.disabledAt = new Date();

      await user.save();
      console.log('2FA disabled successfully');

      // Send 2FA disabled email notification
      try {
        console.log('[2FA] Sending 2FA disabled email to:', user.email);
        const emailResult = await send2FADisabledEmail(user.email, user.name || 'Valued Customer');
        console.log('[2FA] Email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
      } catch (emailError) {
        console.error('[2FA] Email notification error:', emailError.message);
        // Don't fail the 2FA operation if email fails
      }

      return res.json({
        ok: true,
        message: 'Two-factor authentication disabled successfully',
        disabledAt: user.twoFactorAuth.disabledAt
      });
    }
  } catch (error) {
    console.error('Two-factor auth error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});


router.get('/download-data', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });


    let orders = [];
    try {
      const Order = (await import('../models/Order.js')).default;
      orders = await Order.find({ userId: req.user.userId }).lean();
    } catch (e) {

    }


    const userData = {
      profile: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      addresses: user.address || [],
      preferences: user.preferences || {},
      uiConfig: user.uiConfig || {},
      orders: orders.map(order => ({
        id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      })),
      exportedAt: new Date(),
      exportVersion: '1.0'
    };


    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="my-data-${user.email}-${new Date().toISOString().split('T')[0]}.json"`);

    // Send data download notification email
    try {
      console.log('[data-download] Sending notification email to:', user.email);
      const emailResult = await sendDataDownloadEmail(user.email, user.name || 'Valued Customer', new Date().toLocaleString());
      console.log('[data-download] Email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
    } catch (emailError) {
      console.error('[data-download] Email notification error:', emailError.message);
      // Don't fail the download if email fails
    }

    return res.json(userData);
  } catch (error) {
    console.error('Download data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/account', authenticateJWT, async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: 'Please type DELETE to confirm account deletion' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });


    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }


    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.deletionScheduled = {
      scheduledAt: new Date(),
      deletionDate,
      reason: 'user_request'
    };
    user.isActive = false;

    await user.save();

    // Send account deletion notification email
    try {
      console.log('[account-deletion] Sending deletion scheduled email to:', user.email);
      const emailResult = await sendAccountDeletionEmail(user.email, user.name || 'Valued Customer', new Date().toLocaleString());
      console.log('[account-deletion] Email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
    } catch (emailError) {
      console.error('[account-deletion] Email notification error:', emailError.message);
      // Don't fail the deletion if email fails
    }

    return res.json({
      ok: true,
      message: 'Account deletion scheduled',
      deletionDate,
      gracePeriodDays: 30
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/cancel-deletion', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.deletionScheduled) {
      return res.status(400).json({ error: 'No account deletion scheduled' });
    }


    user.deletionScheduled = undefined;
    user.isActive = true;
    await user.save();

    return res.json({
      ok: true,
      message: 'Account deletion cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Regenerate 2FA backup codes
router.post('/two-factor/regenerate-codes', authenticateJWT, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Check if 2FA is enabled
    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({ error: 'Two-factor authentication is not enabled' });
    }

    // Generate new backup codes
    const newBackupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    user.twoFactorAuth.backupCodes = newBackupCodes.map(code => ({ code, used: false }));
    await user.save();

    console.log(`Regenerated backup codes for user: ${user.email}`);

    return res.json({
      ok: true,
      message: 'Backup codes regenerated successfully',
      backupCodes: newBackupCodes,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test 2FA functionality endpoint (development only)
router.post('/two-factor/test', authenticateJWT, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test endpoint not available in production' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const testResults = {
      userId: user._id,
      email: user.email,
      twoFactorAuth: user.twoFactorAuth || {},
      schemaValidation: {
        hasEnabled: user.twoFactorAuth?.hasOwnProperty('enabled'),
        hasMethod: user.twoFactorAuth?.hasOwnProperty('method'),
        hasBackupCodes: Array.isArray(user.twoFactorAuth?.backupCodes)
      },
      timestamp: new Date()
    };

    return res.json({
      ok: true,
      message: '2FA test results',
      results: testResults
    });
  } catch (error) {
    console.error('2FA test error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;


