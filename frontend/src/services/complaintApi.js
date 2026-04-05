import api from './apiClient.js';

export const createComplaintApi = (payload) =>
  api.post('/complaints', payload).then((r) => r.data.data);

export const getMyComplaintsApi = () =>
  api.get('/complaints/me').then((r) => r.data.data);
