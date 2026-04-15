import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
  },
  {
    timestamps: true
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;

