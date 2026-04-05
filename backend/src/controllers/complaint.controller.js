import Complaint from '../models/Complaint.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { successResponse } from '../utils/response.util.js';

export const createComplaintController = async (req, res, next) => {
  try {
    const { courseId, reason, description } = req.body;
    const role = req.user.role;

    let complaintData = { course: courseId, reason, description };

    if (role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) throw Object.assign(new Error('Student profile not found'), { status: 404 });
      complaintData.student = student._id;
      complaintData.submitterRole = 'student';
    } else if (role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) throw Object.assign(new Error('Teacher profile not found'), { status: 404 });
      complaintData.teacher = teacher._id;
      complaintData.submitterRole = 'teacher';
    }

    const complaint = await Complaint.create(complaintData);
    return successResponse(res, complaint, 'Complaint submitted', 201);
  } catch (err) {
    return next(err);
  }
};
