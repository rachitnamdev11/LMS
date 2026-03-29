import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['lecture_added', 'test_result', 'doubt_reply', 'course_updated', 'general', 'announcement'],
      default: 'general'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'student', 'teacher'],
      default: 'all'
    },
    title: String,
    message: String,
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

