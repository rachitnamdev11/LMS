import crypto from 'crypto';
import { env } from '../config/env.config.js';

export const generateOtp = (digits = 6) => {
  const max = 10 ** digits;
  const otp = crypto.randomInt(0, max).toString().padStart(digits, '0');
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
  return { otp, expiresAt };
};

