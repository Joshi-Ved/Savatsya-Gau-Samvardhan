import React, { useEffect, useState } from 'react';
import { Star, User } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { format } from 'date-fns';

interface Review {
    _id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { _id: string, name: string } | string;
}

interface ReviewListProps {
    productId: string;
    refreshTrigger: number; // Increment to refresh list
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, refreshTrigger }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.REVIEWS(productId));
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [productId, refreshTrigger]);

    if (isLoading) {
        return <div className="text-center py-8">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-card rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                No reviews yet. Be the first to review this product!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-medium text-sawatsya-wood dark:text-gray-100 mb-6">Customer Reviews ({reviews.length})</h3>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                        {(typeof review.user === 'object' && review.user?.name) ? review.user.name : review.userName}
                                    </h4>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
