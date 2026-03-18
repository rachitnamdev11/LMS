import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    rating: { type: Number, min: 1, max: 5, required: true }
  },
  {
    timestamps: true
  }
);

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;

