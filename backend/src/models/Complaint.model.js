import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    submitterRole: { type: String, enum: ['student', 'teacher'], default: 'student' },
    reason: {
      type: String,
      enum: ['pirated_content', 'inappropriate_content', 'technical_issue', 'other'],
      required: true
    },
    description: String,
    isResolved: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;

