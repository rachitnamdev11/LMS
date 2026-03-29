import { Router } from 'express';
import { authGuard, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAdminDashboardController,
  // User Management
  listUsersController,
  blockUserController,
  unblockUserController,
  deleteUserController,
  // Course Management
  listCoursesAdminController,
  approveCourseController,
  rejectCourseController,
  deleteCourseAdminController,
  // Reviews
  listReviewsAdminController,
  deleteReviewAdminController,
  // Analytics
  getAnalyticsController,
  // Payments
  listPaymentsController,
  refundPaymentController,
  // Notifications
  broadcastNotificationController,
  // Complaints
  listComplaintsController,
  resolveComplaintController,
  // Logs
  listLogsController,
  // Settings
  getSettingsController,
  updateSettingsController
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authGuard, isAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboardController);

// User Management
router.get('/users', listUsersController);
router.put('/users/block/:id', blockUserController);
router.put('/users/unblock/:id', unblockUserController);
router.delete('/users/:id', deleteUserController);

// Course Management
router.get('/courses', listCoursesAdminController);
router.put('/courses/approve/:id', approveCourseController);
router.put('/courses/reject/:id', rejectCourseController);
router.delete('/courses/:id', deleteCourseAdminController);

// Review Moderation
router.get('/reviews', listReviewsAdminController);
router.delete('/reviews/:id', deleteReviewAdminController);

// Analytics
router.get('/analytics', getAnalyticsController);

// Payment Management
router.get('/payments', listPaymentsController);
router.put('/payments/refund/:id', refundPaymentController);

// Notification Broadcast
router.post('/notifications/broadcast', broadcastNotificationController);

// Complaints
router.get('/complaints', listComplaintsController);
router.post('/complaints/resolve', resolveComplaintController);

// Activity Logs
router.get('/logs', listLogsController);

// Platform Settings
router.get('/settings', getSettingsController);
router.put('/settings', updateSettingsController);

export default router;
