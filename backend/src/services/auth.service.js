import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { generateOtp } from '../utils/otp.util.js';
import { signJwt } from '../utils/jwt.util.js';
import { ROLES } from '../config/roles.constants.js';
import { sendOtpEmail } from './email.service.js';

export const signup = async ({ email, password, role, profile }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { status: 400 });
  }

  const hashed = await hashPassword(password);
  const { otp, expiresAt } = generateOtp();

  const user = await User.create({
    email,
    password: hashed,
    role,
    otpCode: otp,
    otpExpiresAt: expiresAt
  });

  if (role === ROLES.STUDENT) {
    await Student.create({
      user: user._id,
      studentId: `STU-${uuidv4()}`,
      email,
      ...profile
    });
  } else if (role === ROLES.TEACHER) {
    await Teacher.create({
      user: user._id,
      instructorId: `INS-${uuidv4()}`,
      email,
      ...profile
    });
  }

  await sendOtpEmail({ to: email, otp, context: 'signup' });

  return { userId: user._id };
};

export const verifySignupOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  if (!user.otpCode || !user.otpExpiresAt) {
    throw Object.assign(new Error('No OTP requested'), { status: 400 });
  }
  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
  }

  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signJwt({ sub: user._id, role: user.role });
  return { token, role: user.role, _id: user._id };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signJwt({ sub: user._id, role: user.role });
  return { token, role: user.role, _id: user._id };
};

export const requestPasswordReset = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const { otp, expiresAt } = generateOtp();
  user.resetOtpCode = otp;
  user.resetOtpExpiresAt = expiresAt;
  await user.save();

  await sendOtpEmail({ to: email, otp, context: 'reset' });

  return { email };
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  if (!user.resetOtpCode || !user.resetOtpExpiresAt) {
    throw Object.assign(new Error('No reset OTP requested'), { status: 400 });
  }
  if (user.resetOtpCode !== otp || user.resetOtpExpiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
  }

  user.password = await hashPassword(newPassword);
  user.resetOtpCode = undefined;
  user.resetOtpExpiresAt = undefined;
  await user.save();

  return { email };
};

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid old password'), { status: 400 });
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return { email: user.email };
};

