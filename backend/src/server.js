import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';

import { seedAdminIfMissing } from './controllers/admin.controller.js';

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Increase timeout for large video uploads (10 minutes)
server.timeout = 600000;
server.keepAliveTimeout = 600000;
server.headersTimeout = 605000; // slightly longer than keepAliveTimeout

server.listen(PORT, "0.0.0.0", async () => {
  // eslint-disable-next-line no-console
  console.log(`LMS backend running on port ${PORT}`);
  
  try {
    // Ensure at least one admin exists
    await seedAdminIfMissing({
      email: process.env.ADMIN_EMAIL || 'admin@learnx.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
  }
});