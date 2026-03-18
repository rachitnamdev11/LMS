import { Router } from 'express';
import { authGuard, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAdminDashboardController,
  getTeacherDashboardForAdminController,
  getStudentDashboardForAdminController,
  listComplaintsController,
  resolveComplaintController
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authGuard, isAdmin);

router.get('/dashboard', getAdminDashboardController);
router.get('/teachers', getTeacherDashboardForAdminController);
router.get('/students', getStudentDashboardForAdminController);
router.get('/complaints', listComplaintsController);
router.post('/complaints/resolve', resolveComplaintController);

export default router;

