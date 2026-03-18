import { createTest, generateQuestionsWithAI, evaluateTestSubmission, getStudentTestResults } from '../services/test.service.js';
import Test from '../models/Test.model.js';
import { successResponse } from '../utils/response.util.js';

export const createTestController = async (req, res, next) => {
  try {
    const { courseId, lectureId, title, questions } = req.body;
    const test = await createTest({ courseId, lectureId, title, questions });
    return successResponse(res, test, 'Test created', 201);
  } catch (err) {
    return next(err);
  }
};

export const generateTestAIController = async (req, res, next) => {
  try {
    const { lectureTitle, courseName, numQuestions } = req.body;
    const questions = await generateQuestionsWithAI({ lectureTitle, courseName, numQuestions });
    return successResponse(res, questions, 'AI questions generated');
  } catch (err) {
    return next(err);
  }
};

export const submitTestController = async (req, res, next) => {
  try {
    const { testId, answers } = req.body;
    const result = await evaluateTestSubmission({ testId, studentUserId: req.user.id, answers });
    return successResponse(res, result, 'Test evaluated');
  } catch (err) {
    return next(err);
  }
};

export const getLectureTestsController = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    const tests = await Test.find({ lecture: lectureId });
    return successResponse(res, tests, 'Tests fetched');
  } catch (err) {
    return next(err);
  }
};

export const getMyTestResultsController = async (req, res, next) => {
  try {
    const results = await getStudentTestResults({ studentUserId: req.user.id });
    return successResponse(res, results, 'Results fetched');
  } catch (err) {
    return next(err);
  }
};

