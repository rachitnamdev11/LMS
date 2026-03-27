import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

// Increase timeout for large video uploads (10 minutes)
server.timeout = 600000;
server.keepAliveTimeout = 600000;
server.headersTimeout = 605000; // slightly longer than keepAliveTimeout

server.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`LMS backend running on port ${PORT}`);
});