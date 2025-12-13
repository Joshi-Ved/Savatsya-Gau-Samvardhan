import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  currency: { type: String, default: 'INR' },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { _id: false });

const uiConfigSchema = new mongoose.Schema({
  colorScheme: { type: String, default: 'default' },
  fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  animations: { type: Boolean, default: true },
  highContrast: { type: Boolean, default: false },
  reduceMotion: { type: Boolean, default: false }
}, { _id: false });

const twoFactorAuthSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  method: {
    type: String,
    enum: ['email', 'sms', 'app', null],
    default: null,
    required: false
  },
  backupCodes: [{
    code: { type: String, required: true },
    used: { type: Boolean, default: false }
  }],
  enabledAt: { type: Date, required: false },
  disabledAt: { type: Date, required: false }
}, { _id: false });

const deletionScheduleSchema = new mongoose.Schema({
  scheduledAt: Date,
  deletionDate: Date,
  reason: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  name: { type: String },
  phone: { type: String },
  profilePicture: { type: String },
  address: [addressSchema],
  preferences: { type: preferencesSchema, default: () => ({}) },
  uiConfig: { type: uiConfigSchema, default: () => ({}) },
  cart: [{ type: Object }],

  // Password reset functionality
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  passwordChangedAt: Date,
  twoFactorAuth: { type: twoFactorAuthSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
  deletionScheduled: deletionScheduleSchema,
  isAdmin: { type: Boolean, default: false },


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
