import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import ProductImage from '@/components/ui/ProductImage';
import { toast } from 'sonner';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to complete your order');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="section-container min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-medium mb-4">Your Cart is Empty</h1>
        <p className="mb-6">Add some products to your cart to continue shopping.</p>
        <Button asChild className="btn-primary">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="section-container">
      <h1 className="page-title">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        { }
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="font-medium text-xl">Cart Items ({totalItems})</h2>
            </div>

            {items.map((item) => (
              <div key={item.product.id} className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-100">
                <div className="w-full sm:w-24 h-24 flex-shrink-0 mr-4 mb-4 sm:mb-0">
                  <ProductImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                <div className="flex-grow">
                  <Link to={`/product/${item.product.id}`} className="font-medium text-sawatsya-wood hover:text-sawatsya-terracotta">
                    {item.product.name}
                  </Link>

                  {item.product.category === 'incense' && (
                    <p className="text-sm text-gray-600">Fragrance: {item.product.fragrance}</p>
                  )}

                  {item.product.category === 'ghee' && (
                    <p className="text-sm text-gray-600">Weight: {item.product.weight}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center border-t border-b border-gray-300 py-1 text-sm"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 ml-auto text-right">
                  <p className="font-medium text-sawatsya-earth">₹{item.product.price}</p>
                  <p className="text-sm text-gray-600">Subtotal: ₹{item.product.price * item.quantity}</p>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={clearCart}
                className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>

        { }
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="font-medium text-xl mb-4">Order Summary</h2>

            <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="flex justify-between font-medium text-lg mb-6">
              <span>Total</span>
              <span className="text-sawatsya-earth">₹{totalPrice}</span>
            </div>

            <Button onClick={handleCheckout} className="btn-primary w-full">
              Proceed to Checkout
            </Button>

            <div className="mt-6">
              <Link to="/products" className="text-sawatsya-earth hover:text-sawatsya-terracotta text-sm">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
