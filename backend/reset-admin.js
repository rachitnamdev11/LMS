import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './src/models/User.model.js';
import { ROLES } from './src/config/roles.constants.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB...');

    const email = 'admin@learnx.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (user) {
      console.log('Found existing user. Updating password and role...');
      user.password = hashedPassword;
      user.role = ROLES.ADMIN;
      user.isEmailVerified = true;
      user.isBlocked = false;
      await user.save();
    } else {
      console.log('Creating new admin user...');
      user = new User({
        email,
        password: hashedPassword,
        role: ROLES.ADMIN,
        isEmailVerified: true,
        isBlocked: false
      });
      await user.save();
    }
    console.log('Admin account ready! email: admin@learnx.com / password: admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
