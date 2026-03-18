import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: String,
    order: { type: Number, required: true },
    videoUrl: String,
    videoPublicId: String,
    durationSeconds: Number,
    readingMaterials: [
      {
        title: String,
        url: String
      }
    ],
    views: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Lecture = mongoose.model('Lecture', lectureSchema);

export default Lecture;

