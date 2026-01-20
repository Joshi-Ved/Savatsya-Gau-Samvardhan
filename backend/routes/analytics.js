import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// In-memory store for active users (for simple tracking)
const activeUsers = new Set();

// GET /api/analytics/dashboard - Get dashboard stats
router.get('/dashboard', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        // 1. Total Revenue
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        // 2. Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Total Users
        const totalUsers = await User.countDocuments();

        // 4. Recent Orders (last 5)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // 5. Order Status Distribution
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
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// POST /api/analytics/track - Track user actions and broadcast to admins
router.post('/track', express.json(), async (req, res) => {
    try {
        const { actionType, payload, userId } = req.body;
        
        // Track active user
        if (userId) {
            activeUsers.add(userId);
            // Remove after 5 minutes of inactivity
            setTimeout(() => activeUsers.delete(userId), 5 * 60 * 1000);
        }

        // Broadcast to all WebSocket clients (admin panel)
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
    } catch (error) {
        console.error('Error tracking action:', error);
        res.status(500).json({ error: 'Failed to track action' });
    }
});

// GET /api/analytics/active-users - Get count of active users
router.get('/active-users', authenticateJWT, requireAdmin, async (req, res) => {
    try {
        res.json({ count: activeUsers.size });
    } catch (error) {
        console.error('Error fetching active users:', error);
        res.status(500).json({ error: 'Failed to fetch active users' });
    }
});

export default router;
