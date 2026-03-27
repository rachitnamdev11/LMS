import api from './apiClient.js';

/**
 * GET /api/leaderboard/:courseId?period=week|month
 * Returns { leaderboard: [...], currentUser: {...}|null }
 */
export const getCourseLeaderboardApi = (courseId, period) => {
  const params = period ? { period } : {};
  return api.get(`/leaderboard/${courseId}`, { params }).then((r) => r.data.data);
};
