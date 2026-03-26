import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['mcq', 'truefalse', 'oneword', 'fillblank'],
      required: true
    },
    marks: { type: Number, default: 1 },
    // MCQ only
    options: [{ type: String }],
    // For MCQ: index of correct option; for truefalse: 'true'|'false'; for oneword/fillblank: the answer string
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    // Optional extras
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    codeSnippet: { type: String, default: '' },
    explanation: { type: String, default: '' }
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    title: { type: String, required: true },
    duration: { type: Number, default: 30 }, // minutes
    attemptLimit: { type: Number, default: 1 }, // 0 = unlimited
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      value: { type: Number, default: 0.25 } // marks deducted per wrong answer
    },
    questionPool: [questionSchema], // all questions added by instructor
    numQuestionsToServe: { type: Number, default: 10 }, // how many to randomly pick
    totalMarks: { type: Number, default: 0 }, // computed
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Test = mongoose.model('Test', testSchema);
export default Test;
