import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
const user = await mongoose.connection.db.collection('users').findOne({ role: 'teacher' }, { sort: { _id: -1 } });
if (user) {
  console.log("Latest instructor email:", user.email, "OTP:", user.otpCode);
}
process.exit(0);
