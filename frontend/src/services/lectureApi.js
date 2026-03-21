import api from './apiClient.js';

export const incrementLectureViewApi = (lectureId) =>
  api.post(`/lectures/${lectureId}/view`).then((r) => r.data.data);

export const bookmarkLectureApi = (lectureId, lastWatchedSeconds) =>
  api.post('/lectures/bookmark', { lectureId, lastWatchedSeconds }).then((r) => r.data.data);

export const getLectureBookmarkApi = (lectureId) =>
  api.get(`/lectures/${lectureId}/bookmark`).then((r) => r.data.data);

export const completeLectureApi = (lectureId) =>
  api.post(`/lectures/${lectureId}/complete`).then((r) => r.data.data);

export const createLectureApi = (courseId, { title, description, order, videoFile }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  formData.append('order', order || 1);
  if (videoFile) formData.append('video', videoFile);

  return api
    .post(`/lectures/${courseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((r) => r.data.data);
};

export const updateLectureApi = (lectureId, { title, description, order, videoFile }) => {
  const formData = new FormData();
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  if (order) formData.append('order', order);
  if (videoFile) formData.append('video', videoFile);

  return api
    .put(`/lectures/${lectureId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((r) => r.data.data);
};

export const deleteLectureApi = (lectureId) =>
  api.delete(`/lectures/${lectureId}`).then((r) => r.data.data);

export const addOrUpdateLectureNotesApi = (lectureId, pdfFile) => {
  const formData = new FormData();
  formData.append('notes', pdfFile);
  return api
    .post(`/lectures/${lectureId}/notes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((r) => r.data.data);
};

export const getLectureNotesApi = (lectureId) =>
  api.get(`/lectures/${lectureId}/notes`).then((r) => r.data.data);
