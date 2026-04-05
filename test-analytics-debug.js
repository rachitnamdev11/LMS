import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import Test from './backend/src/models/Test.model.js';
import TestResult from './backend/src/models/TestResult.model.js';
import Student from './backend/src/models/Student.model.js';
import Teacher from './backend/src/models/Teacher.model.js';

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const results = await TestResult.find({});
  console.log(`Found ${results.length} test results globally.`);
  
  for (const r of results) {
    if(!r.test) continue;
    const test = await Test.findById(r.test);
    if (!test) {
       console.log(`Result ${r._id} refs missing test ${r.test}`);
       continue;
    }
    console.log(`Result ${r._id} for Test ${r.test} - Score: ${r.score}`);
    
    // Test logic from controller
    const analyticsResults = await TestResult.find({ test: test._id })
       .populate({ path: 'student', model: Student, select: 'firstName lastName email' });
    console.log(`For Test ${test._id}: found ${analyticsResults.length} populated results`);
    const totalStudents = analyticsResults.length;
    if (totalStudents > 0) {
        console.log("Analytics Results retrieved successfully.");
        try {
            const leaderboard = analyticsResults.map(res => ({
                studentId: res.student._id,
                name: `${res.student.firstName} ${res.student.lastName}`,
                score: res.score,
                totalMarks: res.totalMarks,
                accuracy: res.accuracy,
                attemptedAt: res.createdAt
            }));
            console.log("Leaderboard mapped successfully:", leaderboard.length);
        } catch (err) {
            console.error("Error mapping leaderboard:", err.message);
        }
    }
  }

  mongoose.connection.close();
}
verify().catch(console.error);
