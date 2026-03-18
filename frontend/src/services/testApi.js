import api from './apiClient.js';

export const getLectureTestsApi = (lectureId) =>
  api.get(`/tests/lecture/${lectureId}`).then((r) => r.data.data);

export const submitTestApi = (payload) =>
  api.post('/tests/submit', payload).then((r) => r.data.data);

export const getMyTestResultsApi = () =>
  api.get('/tests/me/results').then((r) => r.data.data);

