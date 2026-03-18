import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.config.js';
import { env } from '../config/env.config.js';
import Payment from '../models/Payment.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { enrollStudentInCourse } from './course.service.js';

export const createEnrollmentOrder = async ({ userId, course, amount }) => {
  let student = await Student.findOne({ user: userId });
  if (!student) {
    // If the user is a teacher, generate a student persona for them on the fly
    const teacher = await Teacher.findOne({ user: userId });
    if (teacher) {
      student = await Student.create({
        user: userId,
        studentId: `ST-${Date.now()}`,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email
      });
    } else {
      throw Object.assign(new Error('Student profile not found'), { status: 404 });
    }
  }

  // Razorpay receipt IDs must be ≤ 40 chars
  const receipt = `enrl_${Date.now()}`;

  const options = {
    amount: Math.round(amount * 100),
    currency: env.razorpay.currency,
    receipt
  };
  const order = await razorpayInstance.orders.create(options);
  await Payment.create({
    razorpayOrderId: order.id,
    amount: amount,
    currency: env.razorpay.currency,
    status: 'created',
    student: student._id,
    course,
    type: 'course_enrollment'
  });
  return order;
};

export const createInstructorCourseFeeOrder = async ({ userId, amount }) => {
  const teacher = await Teacher.findOne({ user: userId });
  if (!teacher) {
    throw Object.assign(new Error('Teacher profile not found'), { status: 404 });
  }

  const options = {
    amount: Math.round(amount * 100),
    currency: env.razorpay.currency,
    receipt: `fee_${Date.now()}` // ≤ 40 chars
  };
  const order = await razorpayInstance.orders.create(options);
  await Payment.create({
    razorpayOrderId: order.id,
    amount,
    currency: env.razorpay.currency,
    status: 'created',
    teacher: teacher._id,
    type: 'instructor_course_fee'
  });
  return order;
};

export const verifyPaymentAndFulfill = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw Object.assign(new Error('Invalid payment signature'), { status: 400 });
  }

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    throw Object.assign(new Error('Payment not found'), { status: 404 });
  }

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'paid';
  await payment.save();

  if (payment.type === 'course_enrollment') {
    await enrollStudentInCourse({ studentId: payment.student, courseId: payment.course });
  }

  return payment;
};

