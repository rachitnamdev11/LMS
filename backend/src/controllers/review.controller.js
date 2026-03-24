import Review from '../models/Review.model.js';
import Rating from '../models/Rating.model.js';
import Course from '../models/Course.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { successResponse } from '../utils/response.util.js';

export const addCourseReviewController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { courseId, rating, reviewText } = req.body;

    if (!student.enrolledCourses.includes(courseId)) {
      throw Object.assign(new Error('You must be enrolled in this course to submit a rating'), { status: 403 });
    }

    const existingReview = await Review.findOne({ course: courseId, student: student._id });
    if (existingReview) {
      throw Object.assign(new Error('You have already rated this course'), { status: 400 });
    }

    const review = await Review.create({ course: courseId, student: student._id, rating, reviewText });

    const agg = await Review.aggregate([
      { $match: { course: review.course } },
      { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg[0]) {
      await Course.findByIdAndUpdate(courseId, {
        $set: {
          'ratingsSummary.averageRating': agg[0].avg,
          'ratingsSummary.totalRatings': agg[0].count
        }
      });
    }

    return successResponse(res, review, 'Review added', 201);
  } catch (err) {
    return next(err);
  }
};

export const rateInstructorController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { instructorId, rating } = req.body;
    const teacher = await Teacher.findById(instructorId);
    if (!teacher) {
      throw Object.assign(new Error('Instructor not found'), { status: 404 });
    }

    const ratingDoc = await Rating.create({
      instructor: instructorId,
      student: student._id,
      rating
    });

    const agg = await Rating.aggregate([
      { $match: { instructor: teacher._id } },
      { $group: { _id: '$instructor', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg[0]) {
      teacher.ratings.averageRating = agg[0].avg;
      teacher.ratings.totalRatings = agg[0].count;
      await teacher.save();
    }

    return successResponse(res, ratingDoc, 'Instructor rated');
  } catch (err) {
    return next(err);
  }
};

