import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { authenticateJWT } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import logger from '../utils/logger.js';
import {
  send2FAEnabledEmail,
  send2FADisabledEmail,
  sendDataDownloadEmail,
  sendAccountDeletionEmail
} from '../utils/emailTemplates.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


// GET /api/user/all - List all users (Admin only)
router.get('/all', authenticateJWT, asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  res.json(users);
}));

router.get('/me', authenticateJWT, asyncHandler(async (req, res) => {
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
}));

// Get current 2FA status
router.get('/two-factor/status', authenticateJWT, asyncHandler(async (req, res) => {
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
}));


router.put('/profile', authenticateJWT, asyncHandler(async (req, res) => {
  const { name, email, phone, avatar, profilePicture } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (avatar !== undefined) updates.avatar = avatar;
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;

  const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
  logger.info('user', 'Profile updated');

  return res.json({ ok: true, user });
}));


router.post('/avatar', authenticateJWT, upload.single('avatar'), asyncHandler(async (req, res) => {
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
}));


router.put('/preferences', authenticateJWT, asyncHandler(async (req, res) => {
  const { preferences, uiConfig } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  if (uiConfig) user.uiConfig = { ...user.uiConfig, ...uiConfig };
  await user.save();
  return res.json({ ok: true });
}));


router.post('/addresses', authenticateJWT, asyncHandler(async (req, res) => {
  const addr = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (addr.isDefault) {
    user.address.forEach(a => a.isDefault = false);
  }
  user.address.push(addr);
  await user.save();
  return res.status(201).json({ ok: true });
}));

router.put('/addresses/:id', authenticateJWT, asyncHandler(async (req, res) => {
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
}));

router.delete('/addresses/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.address = user.address.filter(a => a.id !== id);
  await user.save();
  return res.json({ ok: true });
}));


router.put('/change-password', authenticateJWT, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);

  if (!isValidPassword) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  // Set plain password — the pre('save') hook will hash it
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  logger.info('user', 'Password changed successfully');

  return res.json({
    ok: true,
    message: 'Password changed successfully',
    passwordChangedAt: user.passwordChangedAt
  });
}));


router.put('/two-factor', authenticateJWT, asyncHandler(async (req, res) => {
  const { enable, method = 'email', password } = req.body;

  // Validate input
  if (enable === undefined || enable === null) {
    return res.status(400).json({ error: 'Enable parameter is required (true or false)' });
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // For security, require password confirmation for enable, optional for disable
  if (enable && !password) {
    return res.status(400).json({ error: 'Password confirmation is required to enable 2FA' });
  }

  if (password) {
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }
  }

  if (enable) {
    // Enable 2FA
    // Validate method
    const validMethods = ['email', 'sms', 'app'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: 'Invalid method. Must be email, sms, or app' });
    }

    // Generate backup codes using cryptographically secure randomness
    const backupCodes = Array.from({ length: 8 }, () => {
      const bytes = crypto.randomBytes(4);
      return bytes.toString('hex').toUpperCase();
    });

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
    logger.info('2fa', '2FA enabled', { method });

    // Send 2FA enabled email notification
    try {
      await send2FAEnabledEmail(user.email, user.name || 'Valued Customer', method);
    } catch (emailError) {
      logger.error('2fa', 'Failed to send 2FA enabled email', { error: emailError.message });
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
    // Check if 2FA is currently enabled
    if (!user.twoFactorAuth || !user.twoFactorAuth.enabled) {
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
    logger.info('2fa', '2FA disabled');

    // Send 2FA disabled email notification
    try {
      await send2FADisabledEmail(user.email, user.name || 'Valued Customer');
    } catch (emailError) {
      logger.error('2fa', 'Failed to send 2FA disabled email', { error: emailError.message });
    }

    return res.json({
      ok: true,
      message: 'Two-factor authentication disabled successfully',
      disabledAt: user.twoFactorAuth.disabledAt
    });
  }
}));


router.get('/download-data', authenticateJWT, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  let orders = [];
  try {
    const Order = (await import('../models/Order.js')).default;
    orders = await Order.find({ userId: req.user.userId }).lean();
  } catch (e) {
    // Order model may not be available
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
    await sendDataDownloadEmail(user.email, user.name || 'Valued Customer', new Date().toLocaleString());
  } catch (emailError) {
    logger.error('user', 'Failed to send data download email', { error: emailError.message });
  }

  return res.json(userData);
}));


router.delete('/account', authenticateJWT, asyncHandler(async (req, res) => {
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
  logger.info('user', 'Account deletion scheduled');

  // Send account deletion notification email
  try {
    await sendAccountDeletionEmail(user.email, user.name || 'Valued Customer', new Date().toLocaleString());
  } catch (emailError) {
    logger.error('user', 'Failed to send account deletion email', { error: emailError.message });
  }

  return res.json({
    ok: true,
    message: 'Account deletion scheduled',
    deletionDate,
    gracePeriodDays: 30
  });
}));


router.post('/cancel-deletion', authenticateJWT, asyncHandler(async (req, res) => {
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
}));

// Regenerate 2FA backup codes
router.post('/two-factor/regenerate-codes', authenticateJWT, asyncHandler(async (req, res) => {
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

  // Generate new backup codes using cryptographically secure randomness
  const newBackupCodes = Array.from({ length: 8 }, () => {
    const bytes = crypto.randomBytes(4);
    return bytes.toString('hex').toUpperCase();
  });

  user.twoFactorAuth.backupCodes = newBackupCodes.map(code => ({ code, used: false }));
  await user.save();

  logger.info('2fa', 'Backup codes regenerated');

  return res.json({
    ok: true,
    message: 'Backup codes regenerated successfully',
    backupCodes: newBackupCodes,
    generatedAt: new Date()
  });
}));

// Test 2FA functionality endpoint (development only)
router.post('/two-factor/test', authenticateJWT, asyncHandler(async (req, res) => {
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
    logger.error('2fa', '2FA test error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}));

export default router;


