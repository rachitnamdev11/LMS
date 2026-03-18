import { Router } from 'express';
import {
  createLectureController,
  updateLectureController,
  deleteLectureController,
  incrementLectureViewController,
  bookmarkLectureController,
  getLectureBookmarkController,
  completeLectureController
} from '../controllers/lecture.controller.js';
import { authGuard, isTeacher, isStudent } from '../middlewares/auth.middleware.js';
import { videoUpload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authGuard);

router.post('/:courseId', isTeacher, videoUpload.single('video'), createLectureController);
router.put('/:lectureId', isTeacher, videoUpload.single('video'), updateLectureController);
router.delete('/:lectureId', isTeacher, deleteLectureController);

router.post('/:lectureId/view', incrementLectureViewController);

router.post('/bookmark', isStudent, bookmarkLectureController);
router.get('/:lectureId/bookmark', isStudent, getLectureBookmarkController);
router.post('/:lectureId/complete', isStudent, completeLectureController);

export default router;

