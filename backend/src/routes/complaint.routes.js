import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import { createComplaintController, getMyComplaintsController } from '../controllers/complaint.controller.js';

const router = Router();

router.use(authGuard);

// Student: view their own complaints
router.get('/me', isStudent, getMyComplaintsController);

// Both students and teachers can submit complaints
router.post('/', (req, res, next) => {
  if (req.user.role === 'student' || req.user.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, createComplaintController);

export default router;
