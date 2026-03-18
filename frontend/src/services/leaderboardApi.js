import api from './apiClient.js';

export const getLeaderboardApi = () =>
  api.get('/leaderboard').then((r) => r.data.data);

