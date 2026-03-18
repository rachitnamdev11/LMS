import { Router } from 'express';
import { getLeaderboardController } from '../controllers/leaderboard.controller.js';

const router = Router();

router.get('/', getLeaderboardController);

export default router;

