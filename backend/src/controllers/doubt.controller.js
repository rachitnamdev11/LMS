import Doubt from '../models/Doubt.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { successResponse } from '../utils/response.util.js';

export const createDoubtController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { courseId, lectureId, testId, message } = req.body;
    const doubt = await Doubt.create({
      course: courseId,
      lecture: lectureId,
      test: testId,
      student: student._id,
      message
    });
    return successResponse(res, doubt, 'Doubt created', 201);
  } catch (err) {
    return next(err);
  }
};

export const replyDoubtController = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    const { doubtId, message } = req.body;
    const doubt = await Doubt.findByIdAndUpdate(
      doubtId,
      { $push: { replies: { teacher: teacher._id, message } } },
      { new: true }
    );
    return successResponse(res, doubt, 'Reply added');
  } catch (err) {
    return next(err);
  }
};

export const listDoubtsForLectureController = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    const role = req.user.role;

    if (role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) {
        return successResponse(res, [], 'Doubts fetched');
      }
      const doubts = await Doubt.find({ lecture: lectureId, student: student._id })
        .populate('student')
        .populate('replies.teacher');
      return successResponse(res, doubts, 'Doubts fetched');
    }

    if (role === 'teacher') {
    // Show all doubts for this lecture to the instructor viewing it.
    const doubts = await Doubt.find({ lecture: lectureId })
      .populate('student')
      .populate('replies.teacher');
    return successResponse(res, doubts, 'Doubts fetched');
    }

    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (err) {
    return next(err);
  }
};

