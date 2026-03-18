import Course from '../models/Course.model.js';
import {
  createEnrollmentOrder,
  createInstructorCourseFeeOrder,
  verifyPaymentAndFulfill
} from '../services/payment.service.js';
import { successResponse } from '../utils/response.util.js';

export const createCourseEnrollmentOrderController = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      throw Object.assign(new Error('Course not found'), { status: 404 });
    }
    const order = await createEnrollmentOrder({
      userId: req.user.id,
      course: course._id,
      amount: course.price
    });
    return successResponse(res, { orderId: order.id, amount: order.amount, currency: order.currency }, 'Order created');
  } catch (err) {
    return next(err);
  }
};

export const createInstructorCourseFeeOrderController = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const order = await createInstructorCourseFeeOrder({ userId: req.user.id, amount });
    return successResponse(res, { orderId: order.id, amount: order.amount, currency: order.currency }, 'Order created');
  } catch (err) {
    return next(err);
  }
};

export const verifyPaymentController = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await verifyPaymentAndFulfill({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    return successResponse(res, payment, 'Payment verified');
  } catch (err) {
    return next(err);
  }
};

