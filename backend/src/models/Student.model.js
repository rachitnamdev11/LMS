import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    age: Number,
    dateOfBirth: Date,
    email: String,
    phoneNumber: String,
    gender: String,
    address: String,
    profilePictureUrl: String,
    registrationDate: { type: Date, default: Date.now },
    lastLogin: Date,
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    courseProgress: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
        progressPercentage: { type: Number, default: 0 }
      }
    ],
    points: { type: Number, default: 0 },
    viewedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }]
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;

