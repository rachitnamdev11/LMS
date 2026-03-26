import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import {
  upsertTestController,
  getLectureTestController,
  getTestByIdController,
  togglePublishController,
  deleteTestController,
  getTestAnalyticsController,
  startTestSessionController,
  saveProgressController,
  submitTestController,
  getTestResultController,
  getSessionController,
  getMyResultsController
} from '../controllers/test.controller.js';

const router = Router();

// All routes require auth
router.use(authGuard);

// ── Instructor routes ──
router.post('/', isTeacher, upsertTestController);
router.patch('/:testId/publish', isTeacher, togglePublishController);
router.delete('/:testId', isTeacher, deleteTestController);
router.get('/:testId/analytics', isTeacher, getTestAnalyticsController);

// ── Shared read routes (teacher + student) ──
router.get('/lecture/:lectureId', getLectureTestController);
router.get('/me/results', isStudent, getMyResultsController);
router.get('/:testId', getTestByIdController);

// ── Student session routes ──
router.post('/:testId/start', isStudent, startTestSessionController);
router.patch('/:testId/save-progress', isStudent, saveProgressController);
router.post('/:testId/submit', isStudent, submitTestController);
router.get('/:testId/result', isStudent, getTestResultController);
router.get('/:testId/session', isStudent, getSessionController);

export default router;
