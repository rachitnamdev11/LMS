import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    language: String,
    thumbnailUrl: String,
    thumbnailPublicId: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    totalSections: Number,
    totalLectures: Number,
    numberOfLectures: { type: Number, default: 0 },
    ratingsSummary: {
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 }
    },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    isPublished: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isRemovedByAdmin: { type: Boolean, default: false },
    complaintsCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;

