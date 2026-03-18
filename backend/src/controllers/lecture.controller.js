import Lecture from '../models/Lecture.model.js';
import Course from '../models/Course.model.js';
import Student from '../models/Student.model.js';
import Bookmark from '../models/Bookmark.model.js';
import { successResponse } from '../utils/response.util.js';

export const createLectureController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findOne({ _id: courseId, instructor: req.user.id });
    if (!course) {
      throw Object.assign(new Error('Course not found or unauthorized'), { status: 404 });
    }

    const lecture = await Lecture.create({
      course: courseId,
      title,
      description,
      order,
      videoUrl: req.file?.path,
      videoPublicId: req.file?.filename
    });

    course.numberOfLectures += 1;
    await course.save();

    return successResponse(res, lecture, 'Lecture created', 201);
  } catch (err) {
    return next(err);
  }
};

export const updateLectureController = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    const payload = req.body;
    
    // Authorization check to ensure the teacher actually owns this course
    const lectureCheck = await Lecture.findById(lectureId).populate('course');
    if (!lectureCheck) {
      throw Object.assign(new Error('Lecture not found'), { status: 404 });
    }
    if (lectureCheck.course.instructor.toString() !== req.user.id) {
      throw Object.assign(new Error('Unauthorized to modify this lecture'), { status: 403 });
    }

    if (req.file?.path) {
      payload.videoUrl = req.file.path;
      payload.videoPublicId = req.file.filename;
    }
    const lecture = await Lecture.findByIdAndUpdate(lectureId, payload, { new: true });
    return successResponse(res, lecture, 'Lecture updated');
  } catch (err) {
    return next(err);
  }
};

export const deleteLectureController = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    
    // Authorization check to ensure the teacher actually owns this course
    const lectureCheck = await Lecture.findById(lectureId).populate('course');
    if (!lectureCheck) {
      throw Object.assign(new Error('Lecture not found'), { status: 404 });
    }
    if (lectureCheck.course.instructor.toString() !== req.user.id) {
      throw Object.assign(new Error('Unauthorized to delete this lecture'), { status: 403 });
    }

    await Lecture.findByIdAndDelete(lectureId);
    
    // Automatically decrement the counter in the parent course
    await Course.findByIdAndUpdate(lectureCheck.course._id, { $inc: { numberOfLectures: -1 } });

    return successResponse(res, {}, 'Lecture deleted');
  } catch (err) {
    return next(err);
  }
};

export const incrementLectureViewController = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndUpdate(
      lectureId,
      { $inc: { views: 1 } },
      { new: true }
    );
    return successResponse(res, lecture, 'View recorded');
  } catch (err) {
    return next(err);
  }
};

export const bookmarkLectureController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { lectureId, lastWatchedSeconds } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { student: student._id, lecture: lectureId },
      { $set: { lastWatchedSeconds } },
      { new: true, upsert: true }
    );
    return successResponse(res, bookmark, 'Bookmark saved');
  } catch (err) {
    return next(err);
  }
};

export const completeLectureController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      throw Object.assign(new Error('Lecture not found'), { status: 404 });
    }

    const courseEntry =
      student.courseProgress.find((cp) => cp.course.toString() === lecture.course.toString()) ||
      (() => {
        const entry = {
          course: lecture.course,
          completedLectures: [],
          progressPercentage: 0
        };
        student.courseProgress.push(entry);
        return entry;
      })();

    if (!courseEntry.completedLectures.find((l) => l.toString() === lecture._id.toString())) {
      courseEntry.completedLectures.push(lecture._id);
      const course = await Course.findById(lecture.course);
      const totalLectures = course?.numberOfLectures || 1;
      courseEntry.progressPercentage = Math.min(
        100,
        Math.round((courseEntry.completedLectures.length / totalLectures) * 100)
      );
      student.points += 10;
      await student.save();
    }

    return successResponse(res, student.courseProgress, 'Lecture marked as completed');
  } catch (err) {
    return next(err);
  }
};

export const getLectureBookmarkController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { lectureId } = req.params;
    const bookmark = await Bookmark.findOne({ student: student._id, lecture: lectureId });
    return successResponse(res, bookmark || null, 'Bookmark fetched');
  } catch (err) {
    return next(err);
  }
};

