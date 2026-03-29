import mongoose from 'mongoose';
import { ROLES } from '../config/roles.constants.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    otpCode: String,
    otpExpiresAt: Date,
    resetOtpCode: String,
    resetOtpExpiresAt: Date,
    isBlocked: { type: Boolean, default: false },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;

