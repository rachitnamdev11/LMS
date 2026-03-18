import { Router } from 'express';
import {
  searchCoursesController,
  getCourseDetailController,
  createCourseController,
  updateCourseController,
  publishCourseController,
  getStudentEnrolledCoursesController,
  wishlistToggleController,
  getWishlistController,
  getTeacherCoursesController,
  deleteCourseController,
  checkEnrollmentController
} from '../controllers/course.controller.js';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import { imageUpload } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', searchCoursesController);
router.get('/:courseId', getCourseDetailController);

router.use(authGuard);

router.get('/student/enrolled/list', getStudentEnrolledCoursesController);
router.get('/student/enrollment-status/:courseId', checkEnrollmentController);
router.post('/student/wishlist-toggle', isStudent, wishlistToggleController);
router.get('/student/wishlist', isStudent, getWishlistController);

router.get('/teacher/my-courses', isTeacher, getTeacherCoursesController);
router.post('/teacher', isTeacher, imageUpload.single('thumbnail'), createCourseController);
router.put('/teacher/:courseId', isTeacher, imageUpload.single('thumbnail'), updateCourseController);
router.post('/teacher/:courseId/publish', isTeacher, publishCourseController);
router.delete('/teacher/:courseId', isTeacher, deleteCourseController);

export default router;

