import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Lecture = mongoose.model('Lecture', new mongoose.Schema({}, { strict: false }));
    const lectures = await Lecture.find({}, 'title notes notesUrl notesPublicId').lean();
    console.log("All lectures:");
    lectures.forEach(l => {
      console.log(`- ${l.title}: notes=${!!l.notes}, notesUrl=${l.notesUrl || 'none'}`);
    });
    process.exit(0);
  })
  .catch(console.error);
