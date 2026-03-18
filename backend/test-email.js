import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("Transporter Error:", error);
  } else {
    console.log("Server is ready to take our messages");
    
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "Testing email from LMS"
    }, (err, info) => {
      if (err) console.error("Send Error:", err);
      else console.log("Success:", info.response);
      process.exit(0);
    });
  }
});
