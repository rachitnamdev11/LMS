import api from './apiClient.js';

export const createDoubtApi = (payload) =>
  api.post('/doubts', payload).then((r) => r.data.data);

export const listLectureDoubtsApi = (lectureId) =>
  api.get(`/doubts/lecture/${lectureId}`).then((r) => r.data.data);

export const replyDoubtApi = (doubtId, message) =>
  api.post('/doubts/reply', { doubtId, message }).then((r) => r.data.data);

export const getInstructorDoubtsApi = () =>
  api.get('/doubts/instructor').then((r) => r.data.data);

