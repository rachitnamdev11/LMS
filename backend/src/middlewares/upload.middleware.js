import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js';

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif']
  }
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mkv', 'mov']
  }
});

export const imageUpload = multer({ storage: imageStorage });
export const videoUpload = multer({ storage: videoStorage });

