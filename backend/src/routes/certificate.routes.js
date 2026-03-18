import { Router } from 'express';
import { authGuard, isStudent, isTeacher } from '../middlewares/auth.middleware.js';
import {
  issueCertificateController,
  getMyCertificatesController,
  verifyCertificateController
} from '../controllers/certificate.controller.js';

const router = Router();

router.get('/verify/:certificateId', verifyCertificateController);

router.use(authGuard);

router.get('/me', isStudent, getMyCertificatesController);
router.post('/issue', isTeacher, issueCertificateController);

export default router;

