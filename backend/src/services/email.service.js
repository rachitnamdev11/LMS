import { mailTransporter, defaultFromEmail } from '../config/email.config.js';
import { env } from '../config/env.config.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.email.host || !env.email.user || !env.email.pass) {
    throw Object.assign(new Error('Email service is not configured'), { status: 500 });
  }

  const mailOptions = {
    from: defaultFromEmail,
    to,
    subject,
    text: text || undefined,
    html: html || undefined
  };

  await mailTransporter.sendMail(mailOptions);
};

export const sendOtpEmail = async ({ to, otp, context }) => {
  const isSignup = context === 'signup';
  const subject = isSignup 
    ? 'Verify Your Email Address - Learning Management System' 
    : 'Password Reset Request - Learning Management System';
    
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #1e293b; margin-bottom: 20px;">${isSignup ? 'Welcome to our Platform!' : 'Password Reset'}</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">
        ${isSignup 
          ? 'Thank you for signing up. To complete your registration and verify your email address, please use the following One-Time Password (OTP):' 
          : 'We received a request to reset your password. Use the following One-Time Password (OTP) to proceed:'}
      </p>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        This code is valid for 10 minutes. If you did not request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Learning Management System. All rights reserved.
      </p>
    </div>
  `;
  
  await sendEmail({ to, subject, html });
};

