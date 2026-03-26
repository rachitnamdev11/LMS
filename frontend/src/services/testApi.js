import api from './apiClient.js';

// ── Shared ──
export const getLectureTestApi = (lectureId) =>
  api.get(`/tests/lecture/${lectureId}`).then((r) => r.data.data);

export const getTestByIdApi = (testId) =>
  api.get(`/tests/${testId}`).then((r) => r.data.data);

// ── Instructor ──
export const createOrUpdateTestApi = (payload) =>
  api.post('/tests', payload).then((r) => r.data.data);

export const publishTestApi = (testId) =>
  api.patch(`/tests/${testId}/publish`).then((r) => r.data.data);

export const deleteTestApi = (testId) =>
  api.delete(`/tests/${testId}`).then((r) => r.data.data);

export const getTestAnalyticsApi = (testId) =>
  api.get(`/tests/${testId}/analytics`).then((r) => r.data.data);

// ── Student ──
export const startTestSessionApi = (testId) =>
  api.post(`/tests/${testId}/start`).then((r) => r.data.data);

export const saveProgressApi = (testId, payload) =>
  api.patch(`/tests/${testId}/save-progress`, payload).then((r) => r.data.data);

export const submitTestApi = (testId, payload) =>
  api.post(`/tests/${testId}/submit`, payload).then((r) => r.data.data);

export const getTestResultApi = (testId) =>
  api.get(`/tests/${testId}/result`).then((r) => r.data.data);

export const getSessionApi = (testId) =>
  api.get(`/tests/${testId}/session`).then((r) => r.data.data);

export const getMyTestResultsApi = () =>
  api.get('/tests/me/results').then((r) => r.data.data);
