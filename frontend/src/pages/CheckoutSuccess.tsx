
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CheckoutSuccess = () => {
  const location = useLocation();
  const { orderId, orderTotal } = location.state || {};

  return (
    <div className="section-container min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-green-500 text-3xl">✓</span>
        </div>

        <h1 className="text-3xl font-serif font-medium text-sawatsya-wood dark:text-dark-foreground mb-4">
          Thank You For Your Order!
        </h1>

        <p className="text-gray-700 dark:text-dark-muted-foreground mb-6">
          Your payment has been successfully processed and your order is now being prepared by Savatsya Gau Samvardhan.
          You will receive an email confirmation shortly.
        </p>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-dark-border">
          <h2 className="font-medium text-lg mb-4 text-sawatsya-wood dark:text-dark-foreground">Order Details</h2>

          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-dark-muted-foreground">Order ID:</span>
              <span className="font-medium">{orderId ? `#${orderId.slice(-8).toUpperCase()}` : '#SGS' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Total:</span>
              <span className="font-medium text-sawatsya-earth">₹{orderTotal || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span>UPI Payment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span>3-5 Business Days</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="btn-primary">
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
            <Link to="/profile">View Order History</Link>
          </Button>
          <Button asChild variant="outline" className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
