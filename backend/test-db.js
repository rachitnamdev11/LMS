import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './src/models/User.model.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'rachitnamdev11@gmail.com' });
  if (user) {
    console.log('User OTP details:', {
      email: user.email,
      otpCode: user.otpCode,
      otpExpiresAt: user.otpExpiresAt,
      isEmailVerified: user.isEmailVerified
    });
  } else {
    console.log('User not found');
  }
  process.exit(0);
}

check().catch(console.error);
