import api from './apiClient.js';

export const searchCoursesApi = (params) =>
  api.get('/courses', { params }).then((r) => r.data.data);

export const getCourseDetailApi = (courseId) =>
  api.get(`/courses/${courseId}`).then((r) => r.data.data);

export const getStudentEnrolledCoursesApi = () =>
  api.get('/courses/student/enrolled/list').then((r) => r.data.data);

export const getWishlistApi = () =>
  api.get('/courses/student/wishlist').then((r) => r.data.data);

export const toggleWishlistApi = (courseId) =>
  api.post('/courses/student/wishlist-toggle', { courseId }).then((r) => r.data.data);

export const checkEnrollmentApi = (courseId) =>
  api.get(`/courses/student/enrollment-status/${courseId}`).then((r) => r.data.data);


