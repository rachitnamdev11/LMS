import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.config.js';
import { env } from '../config/env.config.js';
import Payment from '../models/Payment.model.js';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { enrollStudentInCourse } from './course.service.js';

export const createEnrollmentOrder = async ({ userId, course, amount }) => {
  const student = await Student.findOne({ user: userId });
  const options = {
    amount: Math.round(amount * 100),
    currency: env.razorpay.currency,
    receipt: `enroll_${course}_${student._id}_${Date.now()}`
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
  const options = {
    amount: Math.round(amount * 100),
    currency: env.razorpay.currency,
    receipt: `teacher_fee_${teacher._id}_${Date.now()}`
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

