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
    allowed_formats: ['mp4', 'mkv', 'mov'],
    chunk_size: 20000000 // 20MB chunk size for much faster video uploads
  }
});

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/notes',
    resource_type: 'raw',   // 'raw' is correct for PDFs — keeps the file as-is with proper Content-Type
    type: 'upload',          // 'upload' = publicly accessible (vs 'authenticated' or 'private')
    access_mode: 'public'   // explicitly mark as public so Cloudinary serves without a signature
  }
});

export const imageUpload = multer({ storage: imageStorage });
export const videoUpload = multer({ storage: videoStorage });
export const pdfUpload = multer({ 
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const err = new Error('Only PDF files are allowed');
      err.status = 400;
      cb(err, false);
    }
  }
});
