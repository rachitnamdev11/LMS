import { getUserNotifications, markNotificationRead } from '../services/notification.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMyNotificationsController = async (req, res, next) => {
  try {
    const notifications = await getUserNotifications({ userId: req.user.id });
    return successResponse(res, notifications, 'Notifications fetched');
  } catch (err) {
    return next(err);
  }
};

export const markNotificationReadController = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await markNotificationRead({ userId: req.user.id, notificationId });
    return successResponse(res, notification, 'Notification updated');
  } catch (err) {
    return next(err);
  }
};

