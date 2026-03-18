import nodemailer from 'nodemailer';
import { env } from './env.config.js';

export const mailTransporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: env.email.port === 465,
  auth: {
    user: env.email.user,
    pass: env.email.pass
  }
});

export const defaultFromEmail = env.email.from || env.email.user;

