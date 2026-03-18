import Complaint from '../models/Complaint.model.js';
import Student from '../models/Student.model.js';
import { successResponse } from '../utils/response.util.js';

export const createComplaintController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { courseId, reason, description } = req.body;
    const complaint = await Complaint.create({
      course: courseId,
      student: student._id,
      reason,
      description
    });
    return successResponse(res, complaint, 'Complaint submitted', 201);
  } catch (err) {
    return next(err);
  }
};

