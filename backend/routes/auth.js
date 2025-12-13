import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { signToken, hashPassword, comparePassword, verifyToken } from '../utils/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../utils/emailTemplates.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    console.log('Checking for existing user with email:', email.toLowerCase());
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const userData = {
      email: email.toLowerCase(),
      password
    };

    // Add name if provided
    if (name && name.trim()) {
      userData.name = name.trim();
    }

    const user = new User(userData);
    await user.save();

    // Send welcome email
    console.log('[auth] Sending welcome email to:', email.toLowerCase());
    try {
      const userName = user.name || name || 'Valued Customer';
      const emailResult = await sendWelcomeEmail(email.toLowerCase(), userName);
      console.log('[auth] Welcome email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
    } catch (emailError) {
      console.error('[auth] Welcome email error:', emailError.message);
      // Don't fail registration if email fails
    }

    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, checking password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful');
    // Use centralized signToken helper which validates JWT_SECRET
    const isAdmin = user.isAdmin || false;
    const token = signToken({ userId: user._id, email: user.email, isAdmin });
    return res.json({ token, email: user.email, userId: user._id, isAdmin });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Check if email exists (for testing)
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existing = await User.findOne({ email: email.toLowerCase() });
    return res.json({ exists: !!existing, email: email.toLowerCase() });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (for testing only)
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

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'No token');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    const payload = verifyToken(token);
    console.log('Token verified successfully. User ID:', payload.userId);

    const user = await User.findById(payload.userId).lean();
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.email);
    return res.json({ email: user.email, userId: user._id, address: user.address || [], preferences: {} });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint (client-side token removal, server-side logging)
router.post('/logout', async (req, res) => {
  try {
    console.log('[auth] User logout requested');

    // In a JWT implementation, logout is typically handled client-side
    // by removing the token. Here we just acknowledge the logout.

    // Optional: You could implement a blacklist for tokens if needed
    // For now, we'll just log and respond

    return res.json({
      ok: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[auth] Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('[auth] Database not connected for password reset');
      return res.status(503).json({
        error: 'Database unavailable. Please try again later or contact support.'
      });
    }

    console.log('[auth] Password reset requested for:', email.toLowerCase());

    // Find user by email with timeout
    const user = await User.findOne({ email: email.toLowerCase() }).maxTimeMS(10000);

    if (!user) {
      // For security, don't reveal if email exists or not
      console.log('[auth] User not found, but sending success response for security');
      return res.json({
        ok: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (for security)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set reset token and expiration (1 hour from now)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    console.log('[auth] Reset token generated and saved for user:', user._id);

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);
      console.log('[auth] Password reset email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
    } catch (emailError) {
      console.error('[auth] Password reset email error:', emailError.message);
      // Don't fail the request if email fails
    }

    return res.json({
      ok: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('[auth] Forgot password error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('[auth] Database not connected for password reset');
      return res.status(503).json({
        error: 'Database unavailable. Please try again later or contact support.'
      });
    }

    console.log('[auth] Password reset attempt with token');

    // Hash the incoming token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).maxTimeMS(10000);

    if (!user) {
      console.log('[auth] Invalid or expired reset token');
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    console.log('[auth] Valid reset token found for user:', user._id);

    // Update password and clear reset fields
    user.password = password; // This will be hashed by the pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    console.log('[auth] Password successfully reset for user:', user._id);

    // Send confirmation email
    try {
      const emailResult = await sendPasswordResetConfirmationEmail(user.email, user.name);
      console.log('[auth] Password reset confirmation email result:', emailResult.ok ? 'Sent successfully' : 'Failed');
    } catch (emailError) {
      console.error('[auth] Password reset confirmation email error:', emailError.message);
      // Don't fail the request if email fails
    }

    return res.json({
      ok: true,
      message: 'Password has been successfully reset. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('[auth] Reset password error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;
