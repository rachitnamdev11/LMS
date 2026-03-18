import api from './apiClient.js';

export const createEnrollmentOrderApi = (courseId) =>
  api.post('/payments/course/order', { courseId }).then((r) => r.data.data);

export const verifyPaymentApi = (payload) =>
  api.post('/payments/verify', payload).then((r) => r.data.data);

