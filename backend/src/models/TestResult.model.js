import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    givenAnswer: { type: mongoose.Schema.Types.Mixed }, // index for MCQ, 'true'/'false', or string
    isCorrect: { type: Boolean },
    marksAwarded: { type: Number, default: 0 }
  },
  { _id: false }
);

const testResultSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    // Questions that were served in this attempt (from pool)
    servedQuestions: [{ type: mongoose.Schema.Types.ObjectId }],
    answers: [answerSchema],
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    unattempted: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // percentage
    timeSpentSeconds: { type: Number, default: 0 },
    violationCount: { type: Number, default: 0 },
    attemptNumber: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const TestResult = mongoose.model('TestResult', testResultSchema);
export default TestResult;
