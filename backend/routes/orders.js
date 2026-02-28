import express from 'express';
import { z } from 'zod';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendEmail, isEmailEnabled } from '../utils/mailer.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validation schema for order creation
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0).optional(), // Client price is ignored; server recalculates
  })).min(1, 'At least one item is required'),
  paymentMethod: z.string().optional().default('UPI'),
  addressId: z.string().optional(),
  paymentTransactionId: z.string().optional(),
});

// GET /api/orders — list orders for current user (paginated)
router.get('/', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ userId })
  ]);

  res.json({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}));


router.post('/', authenticateJWT, validate(createOrderSchema), asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { items, paymentMethod = 'UPI', addressId, paymentTransactionId } = req.body;

  // --- Server-side total calculation ---
  const productIds = items.map(i => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length !== items.length) {
    const foundIds = products.map(p => p._id.toString());
    const missing = productIds.filter(id => !foundIds.includes(id));
    return res.status(400).json({ error: 'Some products not found or inactive', missingProductIds: missing });
  }

  let calculatedTotal = 0;
  const verifiedItems = items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId);
    const lineTotal = product.price * item.quantity;
    calculatedTotal += lineTotal;
    return {
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
    };
  });

  // Fetch user to get address
  const user = await User.findById(userId);
  let shippingAddress = null;

  if (user && addressId) {
    const addr = user.address.find(a => a.id === addressId);
    if (addr) {
      shippingAddress = {
        label: addr.label,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode
      };
    }
  }

  const order = new Order({
    userId,
    items: verifiedItems,
    total: calculatedTotal,
    status: 'pending',
    paymentMethod,
    paymentStatus: paymentTransactionId ? 'verified' : 'pending',
    paymentTransactionId: paymentTransactionId || undefined,
    shippingAddress,
  });

  await order.save();
  logger.info('orders', `Order created: ${order._id} (${order.orderNumber}), total: ${calculatedTotal}`);

  // Broadcast order creation via WebSocket
  try {
    const broadcast = req.app?.locals?.broadcast;
    if (typeof broadcast === 'function') {
      broadcast({ type: 'order.created', data: order });
    }
  } catch (e) {
    logger.warn('orders', 'Failed to broadcast order.created', { error: e?.message });
  }

  // Send order confirmation email (non-blocking)
  try {
    const orderUser = await User.findById(userId).lean();
    const emailEnabled = isEmailEnabled();
    if (orderUser && orderUser.email && emailEnabled) {
      const itemsHtml = (order.items || []).map(i => `
        <li>${i.productName || i.productId} — Qty: ${i.quantity} — ₹${i.price}</li>`).join('');
      const html = `
        <p>Namaste ${orderUser.name || ''},</p>
        <p>Thank you for your order. Your order number is <strong>${order.orderNumber}</strong>.</p>
        <p>Order total: <strong>₹${order.total}</strong></p>
        <ul>${itemsHtml}</ul>
        <p>We will notify you once your order is dispatched.</p>
      `;

      sendEmail({ to: orderUser.email, subject: 'Order confirmation — Savatsya Gau Samvardhan', html })
        .then(sent => logger.info('mailer', 'Order confirmation sent', { success: !!sent }))
        .catch(err => logger.warn('mailer', 'Order confirmation failed', { error: err?.message }));
    }
  } catch (e) {
    logger.warn('orders', 'Failed to send order confirmation email', { error: e?.message });
  }

  // Send success response
  res.status(201).json({
    order,
    emailEnabled: isEmailEnabled(),
    message: 'Order created successfully'
  });
}));


router.get('/all', authenticateJWT, asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
    Order.countDocuments()
  ]);

  res.json({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}));

export default router;
