import mongoose from 'mongoose';
import crypto from 'crypto';

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  unsubscribeToken: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date }
});

// Generate unsubscribe token before saving
subscriberSchema.pre('save', function (next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

export default mongoose.model('Subscriber', subscriberSchema);


