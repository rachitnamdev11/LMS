import { verifyJwt } from '../utils/jwt.util.js';
import { ROLES } from '../config/roles.constants.js';
import User from '../models/User.model.js';
import Lecture from '../models/Lecture.model.js';
import Student from '../models/Student.model.js';

export const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return next();
};

export const isStudent = authorizeRoles(ROLES.STUDENT);
export const isTeacher = authorizeRoles(ROLES.TEACHER);
export const isAdmin = authorizeRoles(ROLES.ADMIN);

export const isEnrolledInCourse = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    // Teachers and admins have unrestricted access
    if (role === ROLES.TEACHER || role === ROLES.ADMIN) {
      return next();
    }

    // Determine lectureId — could come from params or body
    const lectureId = req.params.lectureId || req.body.lectureId;
    if (!lectureId) {
      return res.status(400).json({ success: false, message: 'Lecture ID is required' });
    }

    const lecture = await Lecture.findById(lectureId).select('course');
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    const student = await Student.findOne({ user: userId }).select('enrolledCourses');
    if (!student) {
      return res.status(403).json({ success: false, message: 'Access denied: please enroll in this course first' });
    }

    const isEnrolled = student.enrolledCourses.some(
      (courseId) => courseId.toString() === lecture.course.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Access denied: please enroll in this course first' });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

