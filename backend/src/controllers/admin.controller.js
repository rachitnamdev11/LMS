import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import Course from '../models/Course.model.js';
import Complaint from '../models/Complaint.model.js';
import Payment from '../models/Payment.model.js';
import { ROLES } from '../config/roles.constants.js';
import { successResponse } from '../utils/response.util.js';

export const getAdminDashboardController = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalCourses] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments()
    ]);
    return successResponse(res, { totalStudents, totalTeachers, totalCourses }, 'Admin dashboard');
  } catch (err) {
    return next(err);
  }
};

export const getTeacherDashboardForAdminController = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().lean();
    const teacherIds = teachers.map((t) => t._id);
    const courses = await Course.find({ instructor: { $in: teacherIds } });
    const payments = await Payment.find({ teacher: { $in: teacherIds } });
    return successResponse(res, { teachers, courses, payments }, 'Teacher dashboard');
  } catch (err) {
    return next(err);
  }
};

export const getStudentDashboardForAdminController = async (req, res, next) => {
  try {
    const students = await Student.find().populate('enrolledCourses');
    return successResponse(res, { students }, 'Student dashboard');
  } catch (err) {
    return next(err);
  }
};

export const listComplaintsController = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().populate('course').populate('student');
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
    return successResponse(res, complaint, 'Complaint resolved');
  } catch (err) {
    return next(err);
  }
};

export const seedAdminIfMissing = async ({ email, password }) => {
  const existing = await User.findOne({ role: ROLES.ADMIN });
  if (existing) return;
  if (!email || !password) return;
  const user = new User({
    email,
    password,
    role: ROLES.ADMIN,
    isEmailVerified: true
  });
  await user.save();
};

