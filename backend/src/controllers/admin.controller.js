import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Course from '../models/Course.model.js';
import Complaint from '../models/Complaint.model.js';
import Payment from '../models/Payment.model.js';
import Review from '../models/Review.model.js';
import Notification from '../models/Notification.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import PlatformSettings from '../models/PlatformSettings.model.js';
import Lecture from '../models/Lecture.model.js';
import { ROLES } from '../config/roles.constants.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const getAdminDashboardController = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalUsers, pendingCourses] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      User.countDocuments(),
      Course.countDocuments({ status: 'pending' })
    ]);

    // Active enrollments
    const enrollmentAgg = await Student.aggregate([
      { $project: { count: { $size: { $ifNull: ['$enrolledCourses', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const activeEnrollments = enrollmentAgg[0]?.total || 0;

    // Revenue
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Recent activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('email role createdAt');
    const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5).select('name status createdAt').populate('instructor', 'firstName lastName');
    const recentPayments = await Payment.find({ status: 'paid' }).sort({ createdAt: -1 }).limit(5).populate('student', 'firstName lastName').populate('course', 'name');

    return successResponse(res, {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      pendingCourses,
      activeEnrollments,
      totalRevenue,
      recentUsers,
      recentCourses,
      recentPayments
    }, 'Admin dashboard');
  } catch (err) {
    return next(err);
  }
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
export const listUsersController = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status === 'blocked') filter.isBlocked = true;
    if (status === 'active') filter.isBlocked = { $ne: true };
    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-password -otpCode -otpExpiresAt -resetOtpCode -resetOtpExpiresAt'),
      User.countDocuments(filter)
    ]);

    // Enrich with profile names
    const enriched = await Promise.all(users.map(async (u) => {
      const obj = u.toObject();
      if (u.role === ROLES.STUDENT) {
        const s = await Student.findOne({ user: u._id }).select('firstName lastName');
        obj.firstName = s?.firstName || '';
        obj.lastName = s?.lastName || '';
      } else if (u.role === ROLES.TEACHER) {
        const t = await Teacher.findOne({ user: u._id }).select('firstName lastName');
        obj.firstName = t?.firstName || '';
        obj.lastName = t?.lastName || '';
      }
      return obj;
    }));

    return successResponse(res, { users: enriched, total, page: parseInt(page), limit: parseInt(limit) }, 'Users fetched');
  } catch (err) {
    return next(err);
  }
};

export const blockUserController = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);
    await ActivityLog.create({ user: req.user.id, action: 'block_user', details: { targetUser: req.params.id } });
    return successResponse(res, user, 'User blocked');
  } catch (err) {
    return next(err);
  }
};

export const unblockUserController = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);
    await ActivityLog.create({ user: req.user.id, action: 'unblock_user', details: { targetUser: req.params.id } });
    return successResponse(res, user, 'User unblocked');
  } catch (err) {
    return next(err);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.role === ROLES.ADMIN) return errorResponse(res, 'Cannot delete admin', 403);

    // Delete profile
    if (user.role === ROLES.STUDENT) await Student.deleteOne({ user: user._id });
    if (user.role === ROLES.TEACHER) await Teacher.deleteOne({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({ user: req.user.id, action: 'delete_user', details: { targetUser: req.params.id, email: user.email } });
    return successResponse(res, null, 'User deleted');
  } catch (err) {
    return next(err);
  }
};

// ─── COURSE MANAGEMENT ────────────────────────────────────────────────────────
export const listCoursesAdminController = async (req, res, next) => {
  try {
    const { category, status, instructor, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (instructor) filter.instructor = instructor;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('instructor', 'firstName lastName'),
      Course.countDocuments(filter)
    ]);

    return successResponse(res, { courses, total, page: parseInt(page), limit: parseInt(limit) }, 'Courses fetched');
  } catch (err) {
    return next(err);
  }
};

export const approveCourseController = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { status: 'approved', isPublished: true }, { new: true });
    if (!course) return errorResponse(res, 'Course not found', 404);
    await ActivityLog.create({ user: req.user.id, action: 'approve_course', details: { courseId: req.params.id, name: course.name } });
    return successResponse(res, course, 'Course approved');
  } catch (err) {
    return next(err);
  }
};

export const rejectCourseController = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { status: 'rejected', isPublished: false }, { new: true });
    if (!course) return errorResponse(res, 'Course not found', 404);
    await ActivityLog.create({ user: req.user.id, action: 'reject_course', details: { courseId: req.params.id, name: course.name } });
    return successResponse(res, course, 'Course rejected');
  } catch (err) {
    return next(err);
  }
};

export const deleteCourseAdminController = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, 'Course not found', 404);
    // Delete associated lectures
    await Lecture.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);
    await ActivityLog.create({ user: req.user.id, action: 'delete_course', details: { courseId: req.params.id, name: course.name } });
    return successResponse(res, null, 'Course deleted');
  } catch (err) {
    return next(err);
  }
};

// ─── REVIEW MODERATION ────────────────────────────────────────────────────────
export const listReviewsAdminController = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      Review.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('course', 'name').populate('student', 'firstName lastName'),
      Review.countDocuments()
    ]);
    return successResponse(res, { reviews, total, page: parseInt(page), limit: parseInt(limit) }, 'Reviews fetched');
  } catch (err) {
    return next(err);
  }
};

export const deleteReviewAdminController = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return errorResponse(res, 'Review not found', 404);
    await ActivityLog.create({ user: req.user.id, action: 'delete_review', details: { reviewId: req.params.id } });
    return successResponse(res, null, 'Review deleted');
  } catch (err) {
    return next(err);
  }
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getAnalyticsController = async (req, res, next) => {
  try {
    // Enrollments per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrend = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // Top 5 courses by enrollment
    const topCourses = await Course.find().sort({ 'enrolledStudents': -1 }).limit(5).select('name enrolledStudents').lean();
    const topCoursesData = topCourses.map(c => ({ name: c.name, enrollments: c.enrolledStudents?.length || 0 }));

    // User registrations per month (last 6 months)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, role: '$role' }, count: { $sum: 1 } } },
      { $sort: { '_id.month': 1 } }
    ]);

    // Course category distribution
    const categoryDistribution = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Completion rates
    const completionData = await Student.aggregate([
      { $unwind: { path: '$courseProgress', preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, avgProgress: { $avg: '$courseProgress.progressPercentage' }, totalTracked: { $sum: 1 }, completed: { $sum: { $cond: [{ $gte: ['$courseProgress.progressPercentage', 100] }, 1, 0] } } } }
    ]);

    return successResponse(res, {
      enrollmentTrend,
      topCourses: topCoursesData,
      userGrowth,
      categoryDistribution,
      completionRate: completionData[0] || { avgProgress: 0, totalTracked: 0, completed: 0 }
    }, 'Analytics data');
  } catch (err) {
    return next(err);
  }
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const listPaymentsController = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('student', 'firstName lastName').populate('course', 'name').populate('teacher', 'firstName lastName'),
      Payment.countDocuments(filter)
    ]);

    // Revenue summary
    const summary = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalTransactions: { $sum: 1 } } }
    ]);

    return successResponse(res, { payments, total, page: parseInt(page), limit: parseInt(limit), summary: summary[0] || { totalRevenue: 0, totalTransactions: 0 } }, 'Payments fetched');
  } catch (err) {
    return next(err);
  }
};

export const refundPaymentController = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status: 'refunded' }, { new: true });
    if (!payment) return errorResponse(res, 'Payment not found', 404);
    await ActivityLog.create({ user: req.user.id, action: 'refund_payment', details: { paymentId: req.params.id, amount: payment.amount } });
    return successResponse(res, payment, 'Payment refunded');
  } catch (err) {
    return next(err);
  }
};

// ─── NOTIFICATIONS (BROADCAST) ────────────────────────────────────────────────
export const broadcastNotificationController = async (req, res, next) => {
  try {
    const { title, message, targetAudience = 'all' } = req.body;
    if (!title || !message) return errorResponse(res, 'Title and message are required', 400);

    // Find users to target
    const filter = {};
    if (targetAudience === 'student') filter.role = ROLES.STUDENT;
    if (targetAudience === 'teacher') filter.role = ROLES.TEACHER;

    const users = await User.find(filter).select('_id');
    const notifications = users.map(u => ({
      user: u._id,
      type: 'announcement',
      targetAudience,
      title,
      message,
      isRead: false
    }));

    await Notification.insertMany(notifications);
    await ActivityLog.create({ user: req.user.id, action: 'broadcast_notification', details: { title, targetAudience, recipientCount: users.length } });
    return successResponse(res, { sent: users.length }, 'Notification broadcast sent');
  } catch (err) {
    return next(err);
  }
};

// ─── COMPLAINTS ───────────────────────────────────────────────────────────────
export const listComplaintsController = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).populate('course').populate('student');
    return successResponse(res, complaints, 'Complaints fetched');
  } catch (err) {
    return next(err);
  }
};

export const resolveComplaintController = async (req, res, next) => {
  try {
    const { complaintId, removeCourse } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(complaintId, { $set: { isResolved: true } }, { new: true });
    if (removeCourse && complaint?.course) {
      await Course.findByIdAndUpdate(complaint.course, { $set: { isRemovedByAdmin: true } });
    }
    await ActivityLog.create({ user: req.user.id, action: 'resolve_complaint', details: { complaintId, removeCourse } });
    return successResponse(res, complaint, 'Complaint resolved');
  } catch (err) {
    return next(err);
  }
};

// ─── ACTIVITY LOGS ────────────────────────────────────────────────────────────
export const listLogsController = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('user', 'email role'),
      ActivityLog.countDocuments()
    ]);
    return successResponse(res, { logs, total, page: parseInt(page), limit: parseInt(limit) }, 'Logs fetched');
  } catch (err) {
    return next(err);
  }
};

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export const getSettingsController = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();
    return successResponse(res, settings, 'Settings fetched');
  } catch (err) {
    return next(err);
  }
};

export const updateSettingsController = async (req, res, next) => {
  try {
    const { platformName, categories, maxUploadSizeMB, maintenanceMode, contactEmail, aboutText } = req.body;
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = new PlatformSettings();

    if (platformName !== undefined) settings.platformName = platformName;
    if (categories !== undefined) settings.categories = categories;
    if (maxUploadSizeMB !== undefined) settings.maxUploadSizeMB = maxUploadSizeMB;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (aboutText !== undefined) settings.aboutText = aboutText;

    await settings.save();
    await ActivityLog.create({ user: req.user.id, action: 'update_settings', details: req.body });
    return successResponse(res, settings, 'Settings updated');
  } catch (err) {
    return next(err);
  }
};

import bcrypt from 'bcryptjs';

// ─── ADMIN SEEDER ─────────────────────────────────────────────────────────────
export const seedAdminIfMissing = async ({ email, password }) => {
  const existing = await User.findOne({ role: ROLES.ADMIN });
  if (existing) return;
  if (!email || !password) return;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashedPassword,
    role: ROLES.ADMIN,
    isEmailVerified: true
  });
  await user.save();
  console.log(`Admin user created: ${email}`);
};