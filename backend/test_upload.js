import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('src/.env') }); // or just load dotenv normally

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadPdf = async () => {
  try {
    const res = await cloudinary.uploader.upload('./package.json', {
      folder: 'lms/notes',
      resource_type: 'raw',
      type: 'upload',
      allowed_formats: ['pdf'],
      access_mode: 'public'
    });
    console.log(res);
  } catch (err) {
    console.error('Upload Error:', err);
  }
};

uploadPdf();
