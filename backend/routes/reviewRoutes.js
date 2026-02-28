import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router({ mergeParams: true });

// POST /api/products/:productId/reviews - Create a review
router.post('/', authenticateJWT, asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user.userId;

    // Check if product exists (by slug or ID)
    let product = await Product.findOne({ slug: productId });
    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId);
    }

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: userId, product: product._id });
    if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const userName = req.user.name || 'User';

    const review = await Review.create({
        user: userId,
        product: product._id,
        userName,
        rating: Number(rating),
        comment
    });

    // Update product stats
    const reviews = await Review.find({ product: product._id });
    product.numReviews = reviews.length;
    product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await product.save();

    res.status(201).json(review);
}));

// GET /api/products/:productId/reviews - Get reviews for a product
router.get('/', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let product = await Product.findOne({ slug: productId });

    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId);
    }

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
        .populate('user', 'name')
        .sort({ createdAt: -1 });
    res.json(reviews);
}));

// DELETE /api/products/:productId/reviews/:id - Delete a review (Admin only)
router.delete('/:id', authenticateJWT, requireAdmin, asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return res.status(404).json({ error: 'Review not found' });
    }

    await review.deleteOne();

    // Recalculate stats
    const product = await Product.findById(req.params.productId);
    if (product) {
        const reviews = await Review.find({ product: req.params.productId });
        product.numReviews = reviews.length;
        product.rating = reviews.length === 0 ? 0 : reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await product.save();
    }

    res.json({ message: 'Review deleted successfully' });
}));

export default router;
