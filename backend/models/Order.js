import mongoose from 'mongoose';
import crypto from 'crypto';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'completed', 'shipped', 'delivered', 'cancelled'] },
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, default: 'pending', enum: ['pending', 'verified', 'failed'] },
  paymentTransactionId: { type: String },
  shippingAddress: {
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  orderNumber: { type: String, unique: true }
}, {
  timestamps: true
});

// Indexes for common queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });

// Generate unique order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.orderNumber = `SGS-${randomPart}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
