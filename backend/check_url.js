import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Lecture = mongoose.model('Lecture', new mongoose.Schema({}, { strict: false }));
  const lecture = await Lecture.findOne({ notesUrl: { $ne: '' } }).sort({ updatedAt: -1 });
  
  if (!lecture) {
    console.log("No lecture found with notesUrl");
  } else {
    console.log("Found notesUrl:", lecture.notesUrl);
    try {
        const res = await fetch(lecture.notesUrl, { method: 'HEAD' });
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get('content-type'));
        console.log("Content-Disposition:", res.headers.get('content-disposition'));
        console.log("X-Frame-Options:", res.headers.get('x-frame-options'));
    } catch (e) { console.error(e.message); }
  }
  process.exit(0);
}
check();
