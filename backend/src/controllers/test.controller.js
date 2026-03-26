import Test from '../models/Test.model.js';
import TestResult from '../models/TestResult.model.js';
import TestSession from '../models/TestSession.model.js';
import Teacher from '../models/Teacher.model.js';
import Student from '../models/Student.model.js';
import Course from '../models/Course.model.js';
import Lecture from '../models/Lecture.model.js';
import { successResponse } from '../utils/response.util.js';
import AppError from '../utils/AppError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTeacherDoc = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId });
  if (!teacher) throw new AppError('Teacher profile not found', 404);
  return teacher;
};

const getStudentDoc = async (userId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new AppError('Student profile not found', 404);
  return student;
};

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Evaluate a single answer
const evaluateAnswer = (question, givenAnswer) => {
  if (givenAnswer === undefined || givenAnswer === null || givenAnswer === '') {
    return { isCorrect: false, unattempted: true };
  }
  const correct = question.correctAnswer;
  let isCorrect = false;

  switch (question.questionType) {
    case 'mcq':
      isCorrect = Number(givenAnswer) === Number(correct);
      break;
    case 'truefalse':
      isCorrect = String(givenAnswer).toLowerCase() === String(correct).toLowerCase();
      break;
    case 'oneword':
    case 'fillblank':
      isCorrect = String(givenAnswer).trim().toLowerCase() === String(correct).trim().toLowerCase();
      break;
  }
  return { isCorrect, unattempted: false };
};

// ─── INSTRUCTOR Controllers ───────────────────────────────────────────────────

/**
 * POST /api/tests  — Create or update a test for a lecture
 */
export const upsertTestController = async (req, res, next) => {
  try {
    const teacher = await getTeacherDoc(req.user.id);
    const {
      lectureId,
      title,
      duration,
      attemptLimit,
      negativeMarking,
      questionPool,
      numQuestionsToServe
    } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) throw new AppError('Lecture not found', 404);

    // Verify course ownership
    const course = await Course.findById(lecture.course);
    if (!course) throw new AppError('Course not found', 404);
    
    if (course.instructor.toString() !== teacher.user.toString()) {
      throw new AppError('You do not own this course', 403);
    }

    // Compute totalMarks
    const totalMarks = (questionPool || []).reduce((sum, q) => sum + (q.marks || 1), 0);

    // Find existing or create new
    let test = await Test.findOne({ lecture: lectureId });
    if (test) {
      // Update
      test.title = title;
      test.duration = duration ?? test.duration;
      test.attemptLimit = attemptLimit ?? test.attemptLimit;
      test.negativeMarking = negativeMarking ?? test.negativeMarking;
      test.questionPool = questionPool ?? test.questionPool;
      test.numQuestionsToServe = numQuestionsToServe ?? test.numQuestionsToServe;
      test.totalMarks = totalMarks;
      await test.save();
    } else {
      test = await Test.create({
        lecture: lectureId,
        course: lecture.course,
        createdBy: teacher.user,
        title,
        duration: duration ?? 30,
        attemptLimit: attemptLimit ?? 1,
        negativeMarking: negativeMarking ?? { enabled: false, value: 0.25 },
        questionPool: questionPool ?? [],
        numQuestionsToServe: numQuestionsToServe ?? 10,
        totalMarks
      });
    }

    return successResponse(res, test, 'Test saved', 200);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tests/lecture/:lectureId — Get published test for a lecture
 */
export const getLectureTestController = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    const test = await Test.findOne({ lecture: lectureId });
    if (!test) return successResponse(res, null, 'No test for this lecture');

    // Teachers get full test; students get published only
    const isTeacher = req.user.role === 'teacher';
    if (!isTeacher && !test.isPublished) {
      return successResponse(res, null, 'No published test for this lecture');
    }

    // For students, strip correct answers from pool and show minimal info
    if (!isTeacher) {
      const stripped = test.toObject();
      stripped.questionPool = stripped.questionPool.map(q => {
        const copy = { ...q };
        delete copy.correctAnswer;
        delete copy.explanation;
        return copy;
      });
      return successResponse(res, stripped, 'Test fetched');
    }

    return successResponse(res, test, 'Test fetched');
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tests/:testId — Get a single test by id
 */
export const getTestByIdController = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);
    if (!test) throw new AppError('Test not found', 404);
    return successResponse(res, test, 'Test fetched');
  } catch (err) {
    return next(err);
  }
};

/**
 * PATCH /api/tests/:testId/publish — Toggle publish/unpublish
 */
export const togglePublishController = async (req, res, next) => {
  try {
    const teacher = await getTeacherDoc(req.user.id);
    const test = await Test.findById(req.params.testId);
    if (!test) throw new AppError('Test not found', 404);
    // createdBy stores User._id (same as teacher.user)
    const ownerId = test.createdBy?.toString();
    const userId  = teacher.user?.toString();
    if (ownerId && userId && ownerId !== userId) {
      throw new AppError('Forbidden', 403);
    }
    test.isPublished = !test.isPublished;
    await test.save();
    return successResponse(res, { isPublished: test.isPublished }, `Test ${test.isPublished ? 'published' : 'unpublished'}`);
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /api/tests/:testId — Delete test and all sessions/results
 */
export const deleteTestController = async (req, res, next) => {
  try {
    const teacher = await getTeacherDoc(req.user.id);
    const test = await Test.findById(req.params.testId);
    if (!test) throw new AppError('Test not found', 404);
    if (test.createdBy?.toString() && teacher.user?.toString() &&
        test.createdBy.toString() !== teacher.user.toString()) {
      throw new AppError('Forbidden', 403);
    }
    await Promise.all([
      Test.findByIdAndDelete(test._id),
      TestResult.deleteMany({ test: test._id }),
      TestSession.deleteMany({ test: test._id })
    ]);
    return successResponse(res, null, 'Test deleted');
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tests/:testId/analytics — Instructor analytics
 */
export const getTestAnalyticsController = async (req, res, next) => {
  try {
    const teacher = await getTeacherDoc(req.user.id);
    const test = await Test.findById(req.params.testId);
    if (!test) throw new AppError('Test not found', 404);
    if (test.createdBy.toString() !== teacher._id.toString()) {
      throw new AppError('Forbidden', 403);
    }

    const results = await TestResult.find({ test: test._id })
      .populate({ path: 'student', model: Student, select: 'firstName lastName email' });

    const totalStudents = results.length;
    if (totalStudents === 0) {
      return successResponse(res, { totalStudents: 0, avgScore: 0, results: [], questionStats: [] }, 'No attempts yet');
    }

    const avgScore = results.reduce((s, r) => s + r.score, 0) / totalStudents;

    // Per-question fail stats
    const questionStats = {};
    for (const r of results) {
      for (const a of r.answers) {
        const qid = a.questionId?.toString();
        if (!qid) continue;
        if (!questionStats[qid]) questionStats[qid] = { correct: 0, incorrect: 0, unattempted: 0 };
        if (a.givenAnswer === undefined || a.givenAnswer === null || a.givenAnswer === '') {
          questionStats[qid].unattempted++;
        } else if (a.isCorrect) {
          questionStats[qid].correct++;
        } else {
          questionStats[qid].incorrect++;
        }
      }
    }

    // Attach question text
    const questionStatsArr = Object.entries(questionStats).map(([qid, stats]) => {
      const q = test.questionPool.id(qid);
      return { questionId: qid, questionText: q?.questionText ?? 'Unknown', ...stats };
    });

    // Sort by failure rate descending
    questionStatsArr.sort((a, b) => b.incorrect - a.incorrect);

    // Leaderboard — sort by score desc
    const leaderboard = results
      .map(r => ({
        studentId: r.student._id,
        name: `${r.student.firstName} ${r.student.lastName}`,
        score: r.score,
        totalMarks: r.totalMarks,
        accuracy: r.accuracy,
        attemptedAt: r.createdAt
      }))
      .sort((a, b) => b.score - a.score);

    return successResponse(res, { totalStudents, avgScore, leaderboard, questionStats: questionStatsArr }, 'Analytics fetched');
  } catch (err) {
    return next(err);
  }
};

// ─── STUDENT Controllers ──────────────────────────────────────────────────────

/**
 * POST /api/tests/:testId/start — Start or resume a test session
 */
export const startTestSessionController = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const test = await Test.findById(req.params.testId);
    if (!test) throw new AppError('Test not found', 404);
    if (!test.isPublished) throw new AppError('This test is not available', 403);

    // Check attempt limit
    if (test.attemptLimit > 0) {
      const previousResults = await TestResult.countDocuments({ test: test._id, student: student._id });
      if (previousResults >= test.attemptLimit) {
        throw new AppError(`Attempt limit reached (${test.attemptLimit})`, 403);
      }
    }

    // Check for existing in-progress session
    let session = await TestSession.findOne({ test: test._id, student: student._id, status: 'in-progress' });

    if (session) {
      // Resume existing session
      const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
      const testDurationSecs = test.duration * 60;
      return successResponse(res, {
        session,
        servedQuestions: getServedQuestionsForStudent(test, session.servedQuestions),
        testDurationSecs,
        timeRemainingSecs: Math.max(0, testDurationSecs - elapsed),
        isResume: true
      }, 'Resuming session');
    }

    // Count previous attempts for attempt number
    const prevAttemptCount = await TestResult.countDocuments({ test: test._id, student: student._id });

    // Create new session — pick random questions from pool
    const poolIds = test.questionPool.map(q => q._id);
    const numToServe = Math.min(test.numQuestionsToServe, poolIds.length);
    const servedIds = shuffle(poolIds).slice(0, numToServe);

    session = await TestSession.create({
      test: test._id,
      student: student._id,
      servedQuestions: servedIds,
      answers: {},
      markedForReview: [],
      violationCount: 0,
      attemptNumber: prevAttemptCount + 1
    });

    return successResponse(res, {
      session,
      servedQuestions: getServedQuestionsForStudent(test, servedIds),
      testDurationSecs: test.duration * 60,
      timeRemainingSecs: test.duration * 60,
      isResume: false
    }, 'Session started');
  } catch (err) {
    return next(err);
  }
};

// Return question objects for served IDs, stripping correct answers
const getServedQuestionsForStudent = (test, servedIds) => {
  return servedIds.map(sid => {
    const q = test.questionPool.id(sid);
    if (!q) return null;
    const obj = q.toObject();
    delete obj.correctAnswer;
    delete obj.explanation;
    return obj;
  }).filter(Boolean);
};

/**
 * PATCH /api/tests/:testId/save-progress — Auto-save answers
 */
export const saveProgressController = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const { answers, markedForReview, violationCount } = req.body;

    const session = await TestSession.findOne({ test: req.params.testId, student: student._id, status: 'in-progress' });
    if (!session) throw new AppError('No active session found', 404);

    if (answers) session.answers = new Map(Object.entries(answers));
    if (markedForReview) session.markedForReview = markedForReview;
    if (violationCount !== undefined) session.violationCount = violationCount;
    session.lastActiveAt = new Date();
    await session.save();

    return successResponse(res, { saved: true }, 'Progress saved');
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/tests/:testId/submit — Submit test and evaluate
 */
export const submitTestController = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const test = await Test.findById(req.params.testId);
    if (!test) throw new AppError('Test not found', 404);

    const session = await TestSession.findOne({ test: test._id, student: student._id, status: 'in-progress' });
    if (!session) throw new AppError('No active session found — test may have already been submitted', 404);

    const { answers: submittedAnswers, violationCount, timeSpentSeconds } = req.body;

    // Merge session answers (Map or plain object) with submitted answers
    let sessionAnswersObj = {};
    if (session.answers instanceof Map) {
      sessionAnswersObj = Object.fromEntries(session.answers);
    } else if (session.answers && typeof session.answers === 'object') {
      sessionAnswersObj = { ...session.answers };
    }
    const finalAnswers = { ...sessionAnswersObj };
    if (submittedAnswers && typeof submittedAnswers === 'object') {
      Object.assign(finalAnswers, submittedAnswers);
    }

    // Evaluate
    const servedIds = session.servedQuestions;
    const servedQuestions = servedIds.map(sid => test.questionPool.id(sid)).filter(Boolean);

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    const answerDocs = [];

    for (const q of servedQuestions) {
      const given = finalAnswers[q._id.toString()];
      const { isCorrect, unattempted: wasUnattempted } = evaluateAnswer(q, given);

      if (wasUnattempted) {
        unattempted++;
        answerDocs.push({ questionId: q._id, givenAnswer: null, isCorrect: false, marksAwarded: 0 });
      } else if (isCorrect) {
        correctAnswers++;
        score += q.marks;
        answerDocs.push({ questionId: q._id, givenAnswer: given, isCorrect: true, marksAwarded: q.marks });
      } else {
        incorrectAnswers++;
        const deduction = (test.negativeMarking?.enabled && test.negativeMarking?.value > 0)
          ? Number(test.negativeMarking.value) : 0;
        score = Math.max(0, score - deduction);
        answerDocs.push({ questionId: q._id, givenAnswer: given, isCorrect: false, marksAwarded: deduction > 0 ? -deduction : 0 });
      }
    }

    const totalMarks = servedQuestions.reduce((s, q) => s + q.marks, 0);
    const accuracy = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    const result = await TestResult.create({
      test: test._id,
      student: student._id,
      servedQuestions: servedIds,
      answers: answerDocs,
      score,
      totalMarks,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      accuracy,
      timeSpentSeconds: timeSpentSeconds ?? 0,
      violationCount: violationCount ?? session.violationCount,
      attemptNumber: session.attemptNumber
    });

    // Mark session as submitted
    session.status = 'submitted';
    await session.save();

    return successResponse(res, result, 'Test submitted and evaluated');
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tests/:testId/result — Get student's latest result with review
 */
export const getTestResultController = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const result = await TestResult.findOne(
      { test: req.params.testId, student: student._id },
      null,
      { sort: { createdAt: -1 } }
    );
    if (!result) throw new AppError('No result found', 404);

    const test = await Test.findById(result.test);
    if (!test) throw new AppError('Test not found', 404);

    // Build detailed review with correct answers and explanations
    const review = result.servedQuestions.map(qid => {
      const q = test.questionPool.id(qid);
      const answer = result.answers.find(a => a.questionId?.toString() === qid.toString());
      if (!q) return null;
      return {
        questionId: qid,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        givenAnswer: answer?.givenAnswer,
        isCorrect: answer?.isCorrect ?? false,
        marksAwarded: answer?.marksAwarded ?? 0,
        marks: q.marks,
        imageUrl: q.imageUrl,
        codeSnippet: q.codeSnippet
      };
    }).filter(Boolean);

    // Compute leaderboard rank
    const allScores = await TestResult.find({ test: result.test }).sort({ score: -1 }).select('score');
    const rank = allScores.findIndex(r => r._id.toString() === result._id.toString()) + 1;

    return successResponse(res, {
      result,
      review,
      rank,
      totalParticipants: allScores.length,
      testTitle: test.title,
      testDuration: test.duration
    }, 'Result fetched');
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tests/:testId/session — Get current student's in-progress session
 */
export const getSessionController = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const session = await TestSession.findOne({ test: req.params.testId, student: student._id, status: 'in-progress' });
    if (!session) return successResponse(res, null, 'No active session');

    const test = await Test.findById(req.params.testId);
    if (!test) throw new AppError('Test not found', 404);

    return successResponse(res, {
      session,
      servedQuestions: getServedQuestionsForStudent(test, session.servedQuestions)
    }, 'Session fetched');
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tests/me/results — Student's all results
 */
export const getMyResultsController = async (req, res, next) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const results = await TestResult.find({ student: student._id })
      .populate('test', 'title lecture')
      .sort({ createdAt: -1 });
    return successResponse(res, results, 'Results fetched');
  } catch (err) {
    return next(err);
  }
};
