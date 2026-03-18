import { Router } from 'express';
import { authGuard, isStudent } from '../middlewares/auth.middleware.js';
import { createComplaintController } from '../controllers/complaint.controller.js';

const router = Router();

router.use(authGuard, isStudent);

router.post('/', createComplaintController);

export default router;

