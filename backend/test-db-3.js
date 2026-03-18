import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
const user = await mongoose.connection.db.collection('users').findOne({ role: 'teacher' }, { sort: { createdAt: -1 } });
if (user) {
  console.log("Latest instructor signup:", user.email, "OTP:", user.otpCode);
} else {
  console.log("No instructors found.");
}
process.exit(0);
