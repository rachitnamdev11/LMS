import { Router } from 'express';
import {
  signupController,
  verifySignupOtpController,
  loginController,
  requestPasswordResetController,
  resetPasswordWithOtpController,
  changePasswordController
} from '../controllers/auth.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', signupController);
router.post('/verify-otp', verifySignupOtpController);
router.post('/login', loginController);
router.post('/forgot-password', requestPasswordResetController);
router.post('/reset-password', resetPasswordWithOtpController);
router.post('/change-password', authGuard, changePasswordController);

export default router;

