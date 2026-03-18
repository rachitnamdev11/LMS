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
import { authGuard, isTeacher, isStudent, isEnrolledInCourse } from '../middlewares/auth.middleware.js';
import { videoUpload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authGuard);

router.post('/:courseId', isTeacher, videoUpload.single('video'), createLectureController);
router.put('/:lectureId', isTeacher, videoUpload.single('video'), updateLectureController);
router.delete('/:lectureId', isTeacher, deleteLectureController);

// Student routes (guarded by payment enrollment check)
router.post('/:lectureId/view', isEnrolledInCourse, incrementLectureViewController);
router.post('/bookmark', isStudent, isEnrolledInCourse, bookmarkLectureController);
router.get('/:lectureId/bookmark', isStudent, isEnrolledInCourse, getLectureBookmarkController);
router.post('/:lectureId/complete', isStudent, isEnrolledInCourse, completeLectureController);

export default router;


