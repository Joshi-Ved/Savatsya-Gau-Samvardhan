import express from 'express';
import rateLimit from 'express-rate-limit';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory store for active users (for simple tracking)
const activeUsers = new Set();

// Rate limit tracking endpoint to prevent abuse
const trackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: 'Too many tracking requests',
});

// GET /api/analytics/dashboard - Get dashboard stats
router.get('/dashboard', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email');
    const statusDistribution = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
        totalRevenue,
        totalOrders,
        totalUsers,
        recentOrders,
        statusDistribution
    });
}));

// POST /api/analytics/track - Track user actions and broadcast to admins
router.post('/track', trackLimiter, express.json(), asyncHandler(async (req, res) => {
    const { actionType, payload, userId } = req.body;

    if (!actionType) {
      return res.status(400).json({ error: 'actionType is required' });
    }
    
    if (userId) {
        activeUsers.add(userId);
        setTimeout(() => activeUsers.delete(userId), 5 * 60 * 1000);
    }

    if (req.app.locals.broadcast) {
        req.app.locals.broadcast({
            type: 'user_action',
            actionType,
            payload,
            user: userId || 'Anonymous',
            timestamp: new Date()
        });
    }

    res.json({ success: true });
}));

// GET /api/analytics/active-users - Get count of active users
router.get('/active-users', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
    res.json({ count: activeUsers.size });
}));

export default router;
