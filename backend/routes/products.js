import express from 'express';
import Product from '../models/Product.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /api/products - List all active products
router.get('/', asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
}));

// GET /api/products/admin - List ALL products (including inactive) - Admin only
router.get('/admin', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
}));

// GET /api/products/:id - Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
}));

// POST /api/products - Create new product - Admin only
router.post('/', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    logger.error('products', 'Error creating product', { error: error.message });
    res.status(400).json({ error: error.message || 'Failed to create product' });
  }
}));

// PUT /api/products/:id - Update product - Admin only
router.put('/:id', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    logger.error('products', 'Error updating product', { error: error.message });
    res.status(400).json({ error: error.message || 'Failed to update product' });
  }
}));

// DELETE /api/products/:id - Soft delete product - Admin only
router.delete('/:id', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ message: 'Product deactivated successfully', product });
}));

export default router;
