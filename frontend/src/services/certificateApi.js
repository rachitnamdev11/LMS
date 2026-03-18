import api from './apiClient.js';

export const getMyCertificatesApi = () =>
  api.get('/certificates/me').then((r) => r.data.data);

