
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getProductById } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import ProductImage from '@/components/ui/ProductImage';
import { toast } from 'sonner';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = productId ? getProductById(productId) : undefined;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

  if (!product) {
    return (
      <div className="section-container min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-medium mb-4 dark:text-gray-100">Product Not Found</h1>
        <p className="mb-6 dark:text-gray-400">The product you are looking for does not exist or has been removed.</p>
        <Button asChild className="btn-primary">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="section-container">
      <div className="mb-6">
        <Link to="/products" className="text-sawatsya-earth hover:text-sawatsya-terracotta transition-colors">
          &larr; Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-white dark:bg-dark-card rounded-lg overflow-hidden shadow-sm">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full aspect-square object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-2">{product.name}</h1>

          <div className="flex items-center mt-2 mb-4">
            <span className="text-2xl font-medium text-sawatsya-earth">₹{product.price}</span>
          </div>

          {product.category === 'incense' && (
            <div className="mb-4 dark:text-gray-300">
              <span className="font-medium text-gray-700 dark:text-gray-200">Fragrance:</span> {product.fragrance}
            </div>
          )}

          {product.category === 'ghee' && (
            <div className="mb-4 dark:text-gray-300">
              <span className="font-medium text-gray-700 dark:text-gray-200">Weight:</span> {product.weight}
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Description:</h3>
            <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
          </div>

          <div className="mb-6">
            <label htmlFor="quantity" className="block font-medium text-gray-700 dark:text-gray-200 mb-2">
              Quantity:
            </label>
            <div className="flex items-center">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                -
              </button>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center border-t border-b border-gray-300 dark:border-gray-600 py-1 bg-white dark:bg-gray-800 dark:text-gray-200"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleAddToCart} className="btn-primary flex-1">
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} className="btn-secondary flex-1">
              Buy Now
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Additional Information:</h3>
            {product.category === 'incense' && (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Handcrafted using traditional methods</li>
                <li>• Natural ingredients</li>
                <li>• Burning time: approximately 45 minutes per stick</li>
                <li>• 20 sticks per pack</li>
              </ul>
            )}
            {product.category === 'ghee' && (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Made from A2 cow milk</li>
                <li>• Prepared using the traditional bilona method</li>
                <li>• No additives or preservatives</li>
                <li>• Rich in nutrients and beneficial fatty acids</li>
              </ul>
            )}
          </div>

          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-2xl font-serif font-medium text-sawatsya-wood dark:text-gray-100 mb-6">Reviews & Ratings</h2>
            <div className="grid grid-cols-1 gap-10">
              <ReviewForm
                productId={product.id}
                onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)}
              />
              <ReviewList
                productId={product.id}
                refreshTrigger={reviewsRefreshTrigger}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
