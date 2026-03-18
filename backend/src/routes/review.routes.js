import { Router } from 'express';
import { authGuard, isStudent } from '../middlewares/auth.middleware.js';
import {
  addCourseReviewController,
  rateInstructorController
} from '../controllers/review.controller.js';

const router = Router();

router.use(authGuard, isStudent);

router.post('/course', addCourseReviewController);
router.post('/instructor', rateInstructorController);

export default router;

