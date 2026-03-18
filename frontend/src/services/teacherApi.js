import api from './apiClient.js';

export const getTeacherCoursesApi = () =>
  api.get('/courses/teacher/my-courses').then((r) => r.data.data);

export const createCourseApi = ({ name, description, price, category, language, thumbnailFile }) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description || '');
  formData.append('price', price || 0);
  if (category) formData.append('category', category);
  if (language) formData.append('language', language);
  if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

  return api
    .post('/courses/teacher', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((r) => r.data.data);
};

export const updateCourseThumbnailApi = (courseId, thumbnailFile) => {
  const formData = new FormData();
  formData.append('thumbnail', thumbnailFile);
  return api
    .put(`/courses/teacher/${courseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((r) => r.data.data);
};

export const publishCourseApi = (courseId) =>
  api.post(`/courses/teacher/${courseId}/publish`).then((r) => r.data.data);

export const deleteCourseApi = (courseId) =>
  api.delete(`/courses/teacher/${courseId}`).then((r) => r.data.data);

