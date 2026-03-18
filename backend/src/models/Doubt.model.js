import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const doubtSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    message: { type: String, required: true },
    replies: [replySchema]
  },
  {
    timestamps: true
  }
);

const Doubt = mongoose.model('Doubt', doubtSchema);

export default Doubt;

