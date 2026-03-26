import mongoose from 'mongoose';
import Course from './backend/src/models/Course.model.js';
import Teacher from './backend/src/models/Teacher.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const course = await Course.findOne();
    const teacher = await Teacher.findOne({ _id: course.instructor });
    console.log("Course Instructor Type:", typeof course.instructor, course.instructor);
    console.log("Teacher ID Type:", typeof teacher?._id, teacher?._id);
    process.exit(0);
});
