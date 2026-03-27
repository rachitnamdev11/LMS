import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import { getCourseLeaderboardController } from '../controllers/leaderboard.controller.js';

const router = Router();

// All leaderboard routes require authentication
router.use(authGuard);

// GET /api/leaderboard/:courseId?period=week|month
router.get('/:courseId', getCourseLeaderboardController);

export default router;
