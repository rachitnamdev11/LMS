import { Router } from 'express';
import { authGuard, isStudent } from '../middlewares/auth.middleware.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { studentEmailInstructorController } from '../controllers/email.controller.js';
import { successResponse } from '../utils/response.util.js';

const router = Router();

router.use(authGuard);

router.get('/me', async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      return successResponse(res, { _id: req.user.id, role: 'student', profile: student, firstName: student?.firstName, lastName: student?.lastName }, 'Me');
    }
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      return successResponse(res, { _id: req.user.id, profileId: teacher?._id, role: 'teacher', profile: teacher, firstName: teacher?.firstName, lastName: teacher?.lastName }, 'Me');
    }
    return successResponse(res, { _id: req.user.id, role: 'admin' }, 'Me');
  } catch (err) {
    return next(err);
  }
});

router.post('/student/email-instructor', isStudent, studentEmailInstructorController);

export default router;

