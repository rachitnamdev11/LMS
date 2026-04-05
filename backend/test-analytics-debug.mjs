import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Test from './src/models/Test.model.js';
import TestResult from './src/models/TestResult.model.js';
import Student from './src/models/Student.model.js';
import Teacher from './src/models/Teacher.model.js';

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const results = await TestResult.find({});
  console.log('Total Results:', results.length);
  
  if(results.length > 0) {
    const r = results[0];
    console.log('Sample Result:', r._id, 'Test ID:', r.test);
    
    // Now let's try the exact query from the controller
    const analyticsResults = await TestResult.find({ test: r.test })
      .populate({ path: 'student', model: Student, select: 'firstName lastName email' });
      
    console.log('Query returned count:', analyticsResults.length);
    if(analyticsResults.length > 0) {
      console.log('Populated student:', analyticsResults[0].student);
    }
  } else {
    console.log("No test results exist in DB.");
  }
  
  mongoose.disconnect();
}
verify().catch(console.error);
