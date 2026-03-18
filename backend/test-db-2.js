import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Connecting to:", process.env.MONGODB_URI);
console.log("DB NAME:", process.env.MONGODB_DB_NAME);

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
const users = await mongoose.connection.db.collection('users').find({}).sort({createdAt: -1}).limit(5).toArray();

console.log("Latest users:", users.map(u => ({ email: u.email, id: u._id, otp: u.otpCode })));
process.exit(0);
