import api from './apiClient.js';

export const getMyNotificationsApi = () =>
  api.get('/notifications/me').then((r) => r.data.data);

export const markNotificationReadApi = (id) =>
  api.post(`/notifications/${id}/read`).then((r) => r.data.data);

