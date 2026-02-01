import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isAuthenticated } = useAuth(); // Assuming AuthContext provides these

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to leave a review');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(API_ENDPOINTS.REVIEWS(productId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is here
                },
                body: JSON.stringify({ rating, comment })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            toast.success('Review submitted successfully');
            setComment('');
            setRating(0);
            onReviewSubmitted();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-50 dark:bg-dark-card p-6 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to share your experience with this product.</p>
                {/* Login button could go here, or just link */}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-medium mb-4 text-sawatsya-wood dark:text-gray-100">Write a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                                aria-label={`Rate ${star} stars`}
                            >
                                <Star
                                    className={`w-6 h-6 ${star <= rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Review
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sawatsya-gold bg-white dark:bg-gray-800 dark:text-gray-100"
                        placeholder="Tell us what you like about this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </form>
        </div>
    );
};

export default ReviewForm;
