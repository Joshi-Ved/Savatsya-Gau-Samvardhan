import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

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

export default router;
