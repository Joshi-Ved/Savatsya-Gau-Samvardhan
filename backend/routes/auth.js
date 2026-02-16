import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { z } from 'zod';
import User from '../models/User.js';
import { signToken, hashPassword, comparePassword, verifyToken } from '../utils/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../utils/emailTemplates.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// --- Validation Schemas ---
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const userData = { email: email.toLowerCase(), password };
  if (name) userData.name = name;

  const user = new User(userData);
  await user.save();

  // Send welcome email (fire-and-forget)
  try {
    const userName = user.name || name || 'Valued Customer';
    await sendWelcomeEmail(email.toLowerCase(), userName);
    logger.info('auth', 'Welcome email sent', { email: email.toLowerCase() });
  } catch (emailError) {
    logger.warn('auth', 'Welcome email failed', { error: emailError.message });
  }

  return res.status(201).json({ message: 'Registered successfully' });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isAdmin = user.isAdmin || false;
  const token = signToken({ userId: user._id, email: user.email, isAdmin });
  logger.info('auth', 'User logged in', { email: user.email });
  return res.json({ token, email: user.email, userId: user._id, isAdmin });
}));

// Check if email exists (for testing) - DISABLED FOR SECURITY
/*
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existing = await User.findOne({ email: email.toLowerCase() });
    return res.json({ exists: !!existing, email: email.toLowerCase() });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
*/

// Delete user (for testing only) - DISABLED FOR SECURITY
/*
router.delete('/delete-test-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await User.deleteOne({ email: email.toLowerCase() });
    return res.json({
      deleted: result.deletedCount > 0,
      email: email.toLowerCase(),
      count: result.deletedCount
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});
*/

router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const payload = verifyToken(token);
  const user = await User.findById(payload.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({ email: user.email, userId: user._id, address: user.address || [], preferences: {} });
}));

// Logout endpoint (client-side token removal, server-side logging)
router.post('/logout', asyncHandler(async (req, res) => {
  return res.json({ ok: true, message: 'Logged out successfully' });
}));

// Forgot password endpoint
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable. Please try again later or contact support.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).maxTimeMS(10000);

  if (!user) {
    // For security, don't reveal if email exists or not
    return res.json({ ok: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetToken, user.name);
    logger.info('auth', 'Password reset email sent', { userId: user._id });
  } catch (emailError) {
    logger.warn('auth', 'Password reset email failed', { error: emailError.message });
  }

  return res.json({ ok: true, message: 'If an account with that email exists, a password reset link has been sent.' });
}));

// Reset password endpoint
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable. Please try again later or contact support.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).maxTimeMS(10000);

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  logger.info('auth', 'Password successfully reset', { userId: user._id });

  try {
    await sendPasswordResetConfirmationEmail(user.email, user.name);
  } catch (emailError) {
    logger.warn('auth', 'Password reset confirmation email failed', { error: emailError.message });
  }

  return res.json({ ok: true, message: 'Password has been successfully reset. You can now log in with your new password.' });
}));

export default router;
