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
import Payment from '../models/Payment.model.js';
import Lecture from '../models/Lecture.model.js';
import Review from '../models/Review.model.js';
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
    
    const coursesWithProgress = (student?.enrolledCourses || []).map(course => {
      const courseObj = course.toObject();
      const progressEntry = student.courseProgress?.find(
        cp => cp.course?.toString() === course._id.toString()
      );
      courseObj.progressPercentage = progressEntry?.progressPercentage || 0;
      return courseObj;
    });

    return successResponse(res, coursesWithProgress, 'Enrolled courses fetched');
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
    
    if (wishlist) {
      // Auto-remove any courses the student is already enrolled in
      const enrolledIds = student.enrolledCourses.map(id => id.toString());
      const initialLength = wishlist.courses.length;
      
      wishlist.courses = wishlist.courses.filter(course => 
        !enrolledIds.includes(course._id.toString())
      );

      // Save if changes were made
      if (wishlist.courses.length !== initialLength) {
        await wishlist.save();
      }
    }

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
    
    let userReview = null;
    if (enrolled) {
      userReview = await Review.findOne({ course: courseId, student: student._id }).lean();
    }

    return successResponse(res, { enrolled, userReview }, 'Enrollment status fetched');
  } catch (err) {
    return next(err);
  }
};

export const getInstructorStudentsController = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('enrolledStudents', 'firstName lastName email avatarUrl')
      .sort({ createdAt: -1 });
    return successResponse(res, courses, 'Instructor students fetched');
  } catch (err) {
    return next(err);
  }
};

export const getInstructorAnalyticsController = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - Number(days));

    // 1. Get all courses by this instructor
    const courses = await Course.find({ instructor: teacherId })
      .lean();

    const courseIds = courses.map(c => c._id);

    // 2. Compute Global Stats
    const uniqueStudents = new Set();
    courses.forEach(c => {
      (c.enrolledStudents || []).forEach(s => uniqueStudents.add(s.toString()));
    });
    const totalStudents = uniqueStudents.size;

    // Revenue
    const payments = await Payment.find({
      course: { $in: courseIds },
      status: 'paid'
    }).lean();

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    const activeStudentsCount = await Student.countDocuments({
      _id: { $in: Array.from(uniqueStudents) },
      lastLogin: { $gte: dateLimit }
    });

    // 3. Course-wise stats & Completion Rate
    let totalCompletedEnrollments = 0;
    let totalEnrollmentsAcrossCourses = 0;

    const courseWiseAnalytics = await Promise.all(courses.map(async (course) => {
      const courseRevenue = payments
        .filter(p => p.course?.toString() === course._id.toString())
        .reduce((sum, p) => sum + p.amount, 0);

      const courseStudents = await Student.find({ enrolledCourses: course._id }).lean();
      
      const totalEnrolled = course.enrolledStudents?.length || 0;
      let completedStudentsCount = 0;

      courseStudents.forEach(student => {
        const progressEntry = student.courseProgress?.find(cp => cp.course?.toString() === course._id.toString());
        if (progressEntry && progressEntry.progressPercentage === 100) {
          completedStudentsCount++;
          totalCompletedEnrollments++;
        }
      });

      totalEnrollmentsAcrossCourses += totalEnrolled;

      const completionRate = totalEnrolled > 0 ? Math.round((completedStudentsCount / totalEnrolled) * 100) : 0;

      // Engagement Rate (Views from lectures)
      const lectures = await Lecture.find({ course: course._id }).lean();
      const totalViews = lectures.reduce((sum, l) => sum + (l.views || 0), 0);

      return {
        _id: course._id,
        name: course.name,
        enrollments: totalEnrolled,
        completionRate,
        engagementRate: totalViews,
        revenue: courseRevenue
      };
    }));

    const averageCompletionRate = totalEnrollmentsAcrossCourses > 0 
      ? Math.round((totalCompletedEnrollments / totalEnrollmentsAcrossCourses) * 100) 
      : 0;

    // Revenue over time (for the line/bar chart)
    const revenueByDate = {};
    payments.forEach(p => {
      if (p.createdAt >= dateLimit) {
        const dateStr = p.createdAt.toISOString().split('T')[0];
        revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + p.amount;
      }
    });

    // Format revenue data for charts
    const revenueTrends = Object.keys(revenueByDate).sort().map(date => ({
      date,
      revenue: revenueByDate[date]
    }));

    return successResponse(res, {
      global: {
        totalStudents,
        activeStudents: activeStudentsCount,
        totalRevenue,
        averageCompletionRate
      },
      revenueTrends,
      courseWiseAnalytics
    }, 'Analytics fetched successfully');

  } catch (err) {
    return next(err);
  }
};



