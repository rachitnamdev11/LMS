import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  timeout: 1200000 // 20 minutes timeout for massive video uploads
});

export default cloudinary;

