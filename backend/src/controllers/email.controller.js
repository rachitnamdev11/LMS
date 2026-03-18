import Teacher from '../models/Teacher.model.js';
import Student from '../models/Student.model.js';
import { sendEmail } from '../services/email.service.js';
import { successResponse } from '../utils/response.util.js';

export const studentEmailInstructorController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const { instructorId, subject, message } = req.body;
    const teacher = await Teacher.findById(instructorId);
    if (!teacher?.email) {
      throw Object.assign(new Error('Instructor email not available'), { status: 400 });
    }
    await sendEmail({
      to: teacher.email,
      subject,
      html: `<p>Message from student ${student.firstName || ''} ${student.lastName || ''} (${student.email}):</p><p>${message}</p>`
    });
    return successResponse(res, {}, 'Email sent');
  } catch (err) {
    return next(err);
  }
};

