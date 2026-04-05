import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import { createComplaintController } from '../controllers/complaint.controller.js';

const router = Router();

router.use(authGuard);

// Both students and teachers can submit complaints
router.post('/', (req, res, next) => {
  if (req.user.role === 'student' || req.user.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden' });
}, createComplaintController);

export default router;
