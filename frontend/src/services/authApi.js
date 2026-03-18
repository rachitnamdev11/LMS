import api from './apiClient.js';

export const signupApi = (payload) => api.post('/auth/signup', payload).then((r) => r.data.data);
export const verifyOtpApi = (payload) => api.post('/auth/verify-otp', payload).then((r) => r.data.data);
export const loginApi = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data.data);
export const forgotPasswordApi = (email) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data.data);
export const resetPasswordApi = (payload) =>
  api.post('/auth/reset-password', payload).then((r) => r.data.data);

export const meApi = async () => api.get('/users/me').then((r) => r.data.data);

