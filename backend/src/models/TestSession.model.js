import mongoose from 'mongoose';

/**
 * TestSession — tracks an in-progress exam attempt.
 * Enables auto-save and resume even after page reload.
 */
const testSessionSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    // The subset of question IDs served from the pool (in order)
    servedQuestions: [{ type: mongoose.Schema.Types.ObjectId }],
    // Current saved answers: { [questionId]: givenAnswer }
    answers: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    // Questions marked for review
    markedForReview: [{ type: mongoose.Schema.Types.ObjectId }],
    startedAt: { type: Date, default: Date.now },
    // Seconds at which the student left the page (for time tracking)
    lastActiveAt: { type: Date, default: Date.now },
    violationCount: { type: Number, default: 0 },
    attemptNumber: { type: Number, default: 1 },
    status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' }
  },
  { timestamps: true }
);

// Index for fast lookup and prevent duplicate active sessions
testSessionSchema.index({ test: 1, student: 1, status: 1 });

const TestSession = mongoose.model('TestSession', testSessionSchema);
export default TestSession;
