import Student from '../models/Student.model.js';
import { successResponse } from '../utils/response.util.js';

export const getLeaderboardController = async (req, res, next) => {
  try {
    const topStudents = await Student.find()
      .sort({ points: -1 })
      .limit(50)
      .select('firstName lastName points');
    return successResponse(res, topStudents, 'Leaderboard fetched');
  } catch (err) {
    return next(err);
  }
};

