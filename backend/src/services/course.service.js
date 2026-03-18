import Course from '../models/Course.model.js';
import Lecture from '../models/Lecture.model.js';
import Student from '../models/Student.model.js';
import Wishlist from '../models/Wishlist.model.js';

export const searchCourses = async ({ q, category, priceMin, priceMax, language, ratingMin, instructorId, page = 1, limit = 12 }) => {
  const filter = { isRemovedByAdmin: false };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  if (language) filter.language = language;
  if (typeof priceMin !== 'undefined' || typeof priceMax !== 'undefined') {
    filter.price = {};
    if (typeof priceMin !== 'undefined') filter.price.$gte = priceMin;
    if (typeof priceMax !== 'undefined') filter.price.$lte = priceMax;
  }
  if (typeof ratingMin !== 'undefined') {
    filter['ratingsSummary.averageRating'] = { $gte: ratingMin };
  }
  if (instructorId) {
    filter.instructor = instructorId;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Course.countDocuments(filter)
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

export const getCourseDetail = async (courseId) => {
  const course = await Course.findById(courseId).populate('instructor');
  if (!course || course.isRemovedByAdmin) {
    throw Object.assign(new Error('Course not found'), { status: 404 });
  }
  const lectures = await Lecture.find({ course: courseId }).sort({ order: 1 });
  return { course, lectures };
};

export const createCourse = async ({ instructorId, payload }) => {
  const course = await Course.create({
    instructor: instructorId,
    ...payload,
    isPublished: false
  });
  return course;
};

export const updateCourse = async ({ courseId, instructorId, payload }) => {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId },
    { $set: payload },
    { new: true }
  );
  if (!course) {
    throw Object.assign(new Error('Course not found or unauthorized'), { status: 404 });
  }
  return course;
};

export const publishCourse = async ({ courseId, instructorId }) => {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId },
    { $set: { isPublished: true } },
    { new: true }
  );
  if (!course) {
    throw Object.assign(new Error('Course not found or unauthorized'), { status: 404 });
  }
  return course;
};

export const enrollStudentInCourse = async ({ studentId, courseId }) => {
  const course = await Course.findById(courseId);
  if (!course || course.isRemovedByAdmin) {
    throw Object.assign(new Error('Course not available'), { status: 400 });
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }

  if (!student.enrolledCourses.includes(course._id)) {
    student.enrolledCourses.push(course._id);
    await student.save();
  }
  if (!course.enrolledStudents.includes(student._id)) {
    course.enrolledStudents.push(student._id);
    await course.save();
  }

  return { courseId: course._id, studentId: student._id };
};

export const toggleWishlistCourse = async ({ studentId, courseId }) => {
  let wishlist = await Wishlist.findOne({ student: studentId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ student: studentId, courses: [] });
  }
  const index = wishlist.courses.findIndex((c) => c.toString() === courseId.toString());
  if (index === -1) {
    wishlist.courses.push(courseId);
  } else {
    wishlist.courses.splice(index, 1);
  }
  await wishlist.save();
  return wishlist;
};

export const deleteCourse = async ({ courseId, instructorId }) => {
  const course = await Course.findOne({ _id: courseId, instructor: instructorId });
  if (!course) {
    throw Object.assign(new Error('Course not found or unauthorized'), { status: 404 });
  }
  // Remove all lectures belonging to this course
  await Lecture.deleteMany({ course: courseId });
  await Course.findByIdAndDelete(courseId);
  return { deleted: true };
};

