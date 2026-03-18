import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import {
  createCourseEnrollmentOrderController,
  createInstructorCourseFeeOrderController,
  verifyPaymentController
} from '../controllers/payment.controller.js';

const router = Router();

router.use(authGuard);

router.post('/course/order', isStudent, createCourseEnrollmentOrderController);
router.post('/instructor-fee/order', isTeacher, createInstructorCourseFeeOrderController);
router.post('/verify', verifyPaymentController);

export default router;

