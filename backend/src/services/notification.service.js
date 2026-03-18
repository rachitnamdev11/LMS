import Notification from '../models/Notification.model.js';

export const sendNotification = async ({ userId, type, title, message, data }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    data
  });
  return notification;
};

export const getUserNotifications = async ({ userId }) => {
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  return notifications;
};

export const markNotificationRead = async ({ userId, notificationId }) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );
  return notification;
};

