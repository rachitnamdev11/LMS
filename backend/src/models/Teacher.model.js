import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    instructorId: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    email: String,
    age: Number,
    gender: String,
    profilePhotoUrl: String,
    address: String,
    qualifications: String,
    experience: String,
    joinDate: { type: Date, default: Date.now },
    lastLogin: Date,
    ratings: {
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;

