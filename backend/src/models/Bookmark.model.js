import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    lastWatchedSeconds: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

bookmarkSchema.index({ student: 1, lecture: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;

