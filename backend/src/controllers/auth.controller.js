import { signup, verifySignupOtp, login, requestPasswordReset, resetPasswordWithOtp, changePassword } from '../services/auth.service.js';
import { successResponse } from '../utils/response.util.js';

export const signupController = async (req, res, next) => {
  try {
    const { email, password, role, profile } = req.body;
    const result = await signup({ email, password, role, profile });
    return successResponse(res, result, 'Signup successful, OTP sent', 201);
  } catch (err) {
    return next(err);
  }
};

export const verifySignupOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await verifySignupOtp({ email, otp });
    return successResponse(res, result, 'Signup verified');
  } catch (err) {
    return next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return next(err);
  }
};

export const requestPasswordResetController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset({ email });
    return successResponse(res, result, 'Reset OTP sent');
  } catch (err) {
    return next(err);
  }
};

export const resetPasswordWithOtpController = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await resetPasswordWithOtp({ email, otp, newPassword });
    return successResponse(res, result, 'Password reset successful');
  } catch (err) {
    return next(err);
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await changePassword({ userId: req.user.id, oldPassword, newPassword });
    return successResponse(res, result, 'Password changed successfully');
  } catch (err) {
    return next(err);
  }
};

