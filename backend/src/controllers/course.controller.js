import {
  searchCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  publishCourse,
  toggleWishlistCourse,
  deleteCourse
} from '../services/course.service.js';
import Course from '../models/Course.model.js';
import Student from '../models/Student.model.js';
import Wishlist from '../models/Wishlist.model.js';
import { successResponse } from '../utils/response.util.js';

export const searchCoursesController = async (req, res, next) => {
  try {
    const {
      q,
      category,
      language,
      priceMin,
      priceMax,
      ratingMin,
      instructorId,
      page,
      limit
    } = req.query;

    const result = await searchCourses({
      q,
      category,
      language,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      ratingMin: ratingMin ? Number(ratingMin) : undefined,
      instructorId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12
    });

    return successResponse(res, result, 'Courses fetched');
  } catch (err) {
    return next(err);
  }
};

export const getCourseDetailController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await getCourseDetail(courseId);
    return successResponse(res, result, 'Course detail fetched');
  } catch (err) {
    return next(err);
  }
};

export const createCourseController = async (req, res, next) => {
  try {
    const payload = req.body;
    if (req.file && req.file.path) {
      payload.thumbnailUrl = req.file.path;
      payload.thumbnailPublicId = req.file.filename;
    }
    const course = await createCourse({ instructorId: req.user.id, payload });
    return successResponse(res, course, 'Course created', 201);
  } catch (err) {
    return next(err);
  }
};

export const updateCourseController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const payload = req.body;
    if (req.file && req.file.path) {
      payload.thumbnailUrl = req.file.path;
      payload.thumbnailPublicId = req.file.filename;
    }
    const course = await updateCourse({ courseId, instructorId: req.user.id, payload });
    return successResponse(res, course, 'Course updated');
  } catch (err) {
    return next(err);
  }
};

export const publishCourseController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await publishCourse({ courseId, instructorId: req.user.id });
    return successResponse(res, course, 'Course published');
  } catch (err) {
    return next(err);
  }
};

export const getStudentEnrolledCoursesController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('enrolledCourses');
    return successResponse(res, student?.enrolledCourses || [], 'Enrolled courses fetched');
  } catch (err) {
    return next(err);
  }
};

export const wishlistToggleController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { courseId } = req.body;
    const wishlist = await toggleWishlistCourse({ studentId: student._id, courseId });
    return successResponse(res, wishlist, 'Wishlist updated');
  } catch (err) {
    return next(err);
  }
};

export const getWishlistController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const wishlist = await Wishlist.findOne({ student: student._id }).populate('courses');
    return successResponse(res, wishlist || { courses: [] }, 'Wishlist fetched');
  } catch (err) {
    return next(err);
  }
};

export const getTeacherCoursesController = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort({ createdAt: -1 });
    return successResponse(res, courses, 'Instructor courses fetched');
  } catch (err) {
    return next(err);
  }
};

export const deleteCourseController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await deleteCourse({ courseId, instructorId: req.user.id });
    return successResponse(res, result, 'Course deleted');
  } catch (err) {
    return next(err);
  }
};

export const checkEnrollmentController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return successResponse(res, { enrolled: false }, 'Enrollment status fetched');
    }
    const enrolled = student.enrolledCourses.some(
      (id) => id.toString() === courseId.toString()
    );
    return successResponse(res, { enrolled }, 'Enrollment status fetched');
  } catch (err) {
    return next(err);
  }
};

