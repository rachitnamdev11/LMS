import Certificate from '../models/Certificate.model.js';
import Student from '../models/Student.model.js';
import Course from '../models/Course.model.js';
import { successResponse } from '../utils/response.util.js';

export const issueCertificateController = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);
    if (!student || !course) {
      throw Object.assign(new Error('Student or course not found'), { status: 404 });
    }
    const certificate = await Certificate.create({
      student: student._id,
      course: course._id,
      verificationUrl: `${process.env.CLIENT_ORIGIN}/certificate/verify`
    });
    return successResponse(res, certificate, 'Certificate issued', 201);
  } catch (err) {
    return next(err);
  }
};

export const getMyCertificatesController = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    const certificates = await Certificate.find({ student: student._id }).populate('course');
    return successResponse(res, certificates, 'Certificates fetched');
  } catch (err) {
    return next(err);
  }
};

export const verifyCertificateController = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId }).populate('student').populate('course');
    if (!cert) {
      throw Object.assign(new Error('Certificate not found'), { status: 404 });
    }
    return successResponse(res, cert, 'Certificate valid');
  } catch (err) {
    return next(err);
  }
};

