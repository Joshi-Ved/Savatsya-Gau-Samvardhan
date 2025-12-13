import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'shipped', 'delivered', 'cancelled'] },
  paymentMethod: { type: String, default: 'UPI' },
  shippingAddress: {
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  orderNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
