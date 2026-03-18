import Test from '../models/Test.model.js';
import TestResult from '../models/TestResult.model.js';
import Student from '../models/Student.model.js';
import Course from '../models/Course.model.js';

// Placeholder AI generator – in production you would call an external AI API here.
export const generateQuestionsWithAI = async ({ lectureTitle, courseName, numQuestions = 5 }) => {
  const questions = [];
  for (let i = 0; i < numQuestions; i += 1) {
    questions.push({
      questionText: `Sample question ${i + 1} for ${lectureTitle} in ${courseName}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0
    });
  }
  return questions;
};

export const createTest = async ({ courseId, lectureId, title, questions }) => {
  const totalMarks = questions.length;
  const test = await Test.create({
    course: courseId,
    lecture: lectureId,
    title,
    questions,
    totalMarks
  });
  return test;
};

export const evaluateTestSubmission = async ({ testId, studentUserId, answers }) => {
  const test = await Test.findById(testId);
  if (!test) {
    throw Object.assign(new Error('Test not found'), { status: 404 });
  }
  const student = await Student.findOne({ user: studentUserId });
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }

  let correct = 0;
  const detailed = test.questions.map((q, idx) => {
    const submitted = answers.find((a) => a.questionIndex === idx);
    const selected = submitted?.selectedOptionIndex ?? -1;
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correct += 1;
    return {
      questionIndex: idx,
      selectedOptionIndex: selected,
      isCorrect
    };
  });

  const result = await TestResult.create({
    test: test._id,
    student: student._id,
    score: correct,
    totalMarks: test.questions.length,
    correctAnswers: correct,
    incorrectAnswers: test.questions.length - correct,
    answers: detailed
  });

  if (result.score / result.totalMarks >= 0.8) {
    student.points += 20;
    await student.save();
  }

  return result;
};

export const getStudentTestResults = async ({ studentUserId }) => {
  const student = await Student.findOne({ user: studentUserId });
  if (!student) return [];
  const results = await TestResult.find({ student: student._id }).populate('test');
  return results;
};

