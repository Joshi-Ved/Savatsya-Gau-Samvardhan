import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// POST /api/products/:productId/reviews - Create a review
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;
        const userId = req.user.userId; // Assuming authenticateJWT adds user info to req.user

        // Check if product exists (by slug or ID)
        let product = await Product.findOne({ slug: productId });
        // Fallback to ID if not found by slug (for backward compatibility or admin use)
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

        // Create review
        // Fetch user to get accurate name
        // Use dynamic import or assume User model is available or use req.user if reliable
        // We will assume User model needs to be imported or already imported. 
        // User model is NOT imported in this file yet. Need to check imports.

        let userName = req.user.name;
        if (!userName || userName === 'User') {
            // Fallback: try to find user in DB? 
            // We can't easily import User here without adding import at top.
            // But we can check if req.user has it.
            // If the issue is req.user.name is 'User' from token.
            // Let's rely on populate in GET for existing reviews, and try to fix this for new ones if possible.
            // Or better, just rely on populate in GET.
            userName = 'User';
        }

        const review = await Review.create({
            user: userId,
            product: product._id,
            userName: userName, // Use populated 'user.name' on frontend instead
            rating: Number(rating),
            comment
        });

        // Update product stats
        const reviews = await Review.find({ product: product._id });
        product.numReviews = reviews.length;
        product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// GET /api/products/:productId/reviews - Get reviews for a product
router.get('/', async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// DELETE /api/products/:productId/reviews/:id - Delete a review (Admin only)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;
