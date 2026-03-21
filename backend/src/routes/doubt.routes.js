import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import {
  createDoubtController,
  replyDoubtController,
  listDoubtsForLectureController,
  getInstructorDoubtsController
} from '../controllers/doubt.controller.js';

const router = Router();

router.use(authGuard);

router.post('/', isStudent, createDoubtController);
router.post('/reply', isTeacher, replyDoubtController);
router.get('/instructor', isTeacher, getInstructorDoubtsController);
router.get('/lecture/:lectureId', listDoubtsForLectureController);

export default router;

