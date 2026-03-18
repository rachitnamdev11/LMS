import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import {
  getMyNotificationsController,
  markNotificationReadController
} from '../controllers/notification.controller.js';

const router = Router();

router.use(authGuard);

router.get('/me', getMyNotificationsController);
router.post('/:notificationId/read', markNotificationReadController);

export default router;

