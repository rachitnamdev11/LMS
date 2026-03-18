import api from './apiClient.js';

export const addCourseReviewApi = (payload) =>
  api.post('/reviews/course', payload).then((r) => r.data.data);

export const rateInstructorApi = (payload) =>
  api.post('/reviews/instructor', payload).then((r) => r.data.data);

