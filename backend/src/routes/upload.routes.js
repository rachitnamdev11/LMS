import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import { imageUpload, videoUpload } from '../middlewares/upload.middleware.js';
import { successResponse } from '../utils/response.util.js';

const router = Router();

router.use(authGuard);

router.post('/image', imageUpload.single('file'), (req, res) => {
  return successResponse(res, { url: req.file.path, publicId: req.file.filename }, 'Image uploaded');
});

router.post('/video', videoUpload.single('file'), (req, res) => {
  return successResponse(res, { url: req.file.path, publicId: req.file.filename }, 'Video uploaded');
});

export default router;

