import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import {
  createTestController,
  generateTestAIController,
  submitTestController,
  getLectureTestsController,
  getMyTestResultsController
} from '../controllers/test.controller.js';

const router = Router();

router.get('/lecture/:lectureId', authGuard, getLectureTestsController);

router.use(authGuard);

router.post('/', isTeacher, createTestController);
router.post('/generate-ai', isTeacher, generateTestAIController);
router.post('/submit', isStudent, submitTestController);
router.get('/me/results', isStudent, getMyTestResultsController);

export default router;

