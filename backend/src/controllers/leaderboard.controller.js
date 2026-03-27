import mongoose from 'mongoose';
import TestResult from '../models/TestResult.model.js';
import Test from '../models/Test.model.js';
import Student from '../models/Student.model.js';
import { successResponse } from '../utils/response.util.js';
import AppError from '../utils/AppError.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGES = [
  { rank: 1, label: 'Top Performer',   icon: '🥇' },
  { rank: 2, label: 'Excellent Learner', icon: '🥈' },
  { rank: 3, label: 'Rising Star',      icon: '🥉' },
];

const getBadge = (rank) => BADGES.find((b) => b.rank === rank) || null;

/**
 * GET /api/leaderboard/:courseId?period=week|month
 *
 * Returns the ranked list of students for a specific course.
 * Ranking is based on:
 *   1. Sum of each student's BEST score per test in the course (highest score only)
 *   2. Tie-break: less total time spent
 *   3. Tie-break: earliest last-completion timestamp
 *
 * Query params:
 *   period: 'week' | 'month' | (omitted → all-time)
 */
export const getCourseLeaderboardController = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { period } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new AppError('Invalid courseId', 400);
    }

    // ── Build time-filter boundary ─────────────────────────────────────────
    let dateFilter = {};
    if (period === 'week') {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      dateFilter = { createdAt: { $gte: since } };
    } else if (period === 'month') {
      const since = new Date();
      since.setMonth(since.getMonth() - 1);
      dateFilter = { createdAt: { $gte: since } };
    }

    // ── Fetch all tests belonging to the course ────────────────────────────
    const courseTests = await Test.find({ course: courseId }).select('_id').lean();
    if (!courseTests.length) {
      return successResponse(res, { leaderboard: [], currentUser: null }, 'No tests in this course');
    }
    const testIds = courseTests.map((t) => t._id);

    // ── Aggregate: best score per (student, test) → sum per student ────────
    const pipeline = [
      // 1. Only consider results for this course's tests
      {
        $match: {
          test: { $in: testIds },
          ...dateFilter,
        },
      },
      // 2. Best attempt per (student, test)
      {
        $sort: { score: -1 }, // highest score first within the group
      },
      {
        $group: {
          _id: { student: '$student', test: '$test' },
          bestScore:       { $max: '$score' },
          bestTotalMarks:  { $first: '$totalMarks' },
          bestAccuracy:    { $max: '$accuracy' },
          timeSpent:       { $min: '$timeSpentSeconds' }, // fastest attempt at best score
          lastAttemptAt:   { $max: '$createdAt' },
        },
      },
      // 3. Aggregate per student across all tests in the course
      {
        $group: {
          _id: '$_id.student',
          totalScore:     { $sum: '$bestScore' },
          totalMarks:     { $sum: '$bestTotalMarks' },
          totalTime:      { $sum: '$timeSpent' },
          testsAttempted: { $sum: 1 },
          lastCompletedAt:{ $max: '$lastAttemptAt' },
          // weighted average of best accuracies
          sumAccuracy:    { $sum: '$bestAccuracy' },
        },
      },
      // 4. Compute overall accuracy
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $gt: ['$testsAttempted', 0] },
              { $round: [{ $divide: ['$sumAccuracy', '$testsAttempted'] }, 1] },
              0,
            ],
          },
        },
      },
      // 5. Sort: score DESC → time ASC → earliest lastCompletedAt ASC
      {
        $sort: {
          totalScore:      -1,
          totalTime:        1,
          lastCompletedAt:  1,
        },
      },
      // 6. Limit to top 50
      { $limit: 50 },
      // 7. Lookup student info
      {
        $lookup: {
          from:         'students',
          localField:   '_id',
          foreignField: '_id',
          as:           'studentDoc',
        },
      },
      { $unwind: '$studentDoc' },
      // 9. Project final shape
      {
        $project: {
          _id: 0,
          studentId:      '$_id',
          firstName:      '$studentDoc.firstName',
          lastName:       '$studentDoc.lastName',
          totalScore:     1,
          totalMarks:     1,
          accuracy:       1,
          testsAttempted: 1,
          totalTime:      1,
          lastCompletedAt:1,
        },
      },
    ];

    const rows = await TestResult.aggregate(pipeline);

    // ── Assign ranks and badges ────────────────────────────────────────────
    const leaderboard = rows.map((row, idx) => ({
      ...row,
      rank:  idx + 1,
      badge: getBadge(idx + 1),
    }));

    // ── Current-user entry (even if outside top 50) ────────────────────────
    let currentUser = null;
    if (req.user) {
      const student = await Student.findOne({ user: req.user.id }).lean();
      if (student) {
        const inList = leaderboard.find(
          (r) => r.studentId.toString() === student._id.toString()
        );
        if (inList) {
          currentUser = inList;
        } else {
          // Calculate their stats separately
          const [myStats] = await TestResult.aggregate([
            { $match: { test: { $in: testIds }, student: student._id, ...dateFilter } },
            { $sort: { score: -1 } },
            {
              $group: {
                _id: { student: '$student', test: '$test' },
                bestScore:      { $max: '$score' },
                bestTotalMarks: { $first: '$totalMarks' },
                bestAccuracy:   { $max: '$accuracy' },
                timeSpent:      { $min: '$timeSpentSeconds' },
                lastAttemptAt:  { $max: '$createdAt' },
              },
            },
            {
              $group: {
                _id:            '$_id.student',
                totalScore:     { $sum: '$bestScore' },
                totalMarks:     { $sum: '$bestTotalMarks' },
                totalTime:      { $sum: '$timeSpent' },
                testsAttempted: { $sum: 1 },
                sumAccuracy:    { $sum: '$bestAccuracy' },
                lastCompletedAt:{ $max: '$lastAttemptAt' },
              },
            },
            {
              $addFields: {
                accuracy: {
                  $cond: [
                    { $gt: ['$testsAttempted', 0] },
                    { $round: [{ $divide: ['$sumAccuracy', '$testsAttempted'] }, 1] },
                    0,
                  ],
                },
              },
            },
          ]);

          if (myStats) {
            // Count how many students score above this student to determine rank
            const aboveCount = await TestResult.aggregate([
              { $match: { test: { $in: testIds }, ...dateFilter } },
              { $sort: { score: -1 } },
              {
                $group: {
                  _id:        { student: '$student', test: '$test' },
                  bestScore:  { $max: '$score' },
                },
              },
              {
                $group: {
                  _id:        '$_id.student',
                  totalScore: { $sum: '$bestScore' },
                },
              },
              { $match: { totalScore: { $gt: myStats.totalScore } } },
              { $count: 'count' },
            ]);
            const myRank = (aboveCount[0]?.count ?? 0) + 1;

            currentUser = {
              studentId:      student._id,
              firstName:      student.firstName,
              lastName:       student.lastName,
              totalScore:     myStats.totalScore,
              totalMarks:     myStats.totalMarks,
              accuracy:       myStats.accuracy,
              testsAttempted: myStats.testsAttempted,
              totalTime:      myStats.totalTime,
              lastCompletedAt:myStats.lastCompletedAt,
              rank:           myRank,
              badge:          getBadge(myRank),
              outsideTop50:   true,
            };
          }
        }
      }
    }

    return successResponse(res, { leaderboard, currentUser }, 'Leaderboard fetched');
  } catch (err) {
    return next(err);
  }
};
